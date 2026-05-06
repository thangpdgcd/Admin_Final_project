import { useEffect, useState } from "react"
import { Table, Input, Button, Space, Modal, Form, Typography } from "antd"
import type { PaginationProps } from "antd"
import type { ColumnsType, TablePaginationConfig } from "antd/es/table"
import dayjs from "dayjs"
import { categoryApi } from "@/api/categoryapi/categoryApi"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { toI18nKey } from "@/utils/i18nKey"
import { ensureDynamicCategoryTranslation, getDynamicTranslation } from "@/utils/dynamicTranslations"

const translateText = async (q: string, target: "vi" | "en"): Promise<string> => {
  const payload = { q, target }
  const tryProxy = async () => {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Translate proxy failed (${res.status})`)
    const data = (await res.json()) as { translatedText?: string }
    return String(data.translatedText || "").trim()
  }

  const tryDirect = async () => {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "auto", format: "text" }),
    })
    if (!res.ok) throw new Error(`Translate direct failed (${res.status})`)
    const data = (await res.json()) as { translatedText?: string }
    return String(data.translatedText || "").trim()
  }

  return tryProxy().catch(() => tryDirect())
}

interface CategoryRow {
  key: string
  id: string
  name: string
  description: string
  createdAt: string
}

interface CategoryApiItem {
  _id: string
  id?: string
  categoriesId?: string | number
  name: string
  description?: string
  createdAt?: string
}

const { Search } = Input

export const Categories = () => {
  const { t, i18n } = useTranslation()
  const [, bumpTranslationVersion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [form] = Form.useForm()
  const nameValue = Form.useWatch("name", form)
  const [namePreview, setNamePreview] = useState<string>("")
  const [namePreviewLoading, setNamePreviewLoading] = useState(false)

  useEffect(() => {
    const handler = () => bumpTranslationVersion((v) => v + 1)
    window.addEventListener("dynamicTranslationsUpdated", handler)
    return () => window.removeEventListener("dynamicTranslationsUpdated", handler)
  }, [])

  useEffect(() => {
    const raw = String(nameValue ?? "").trim()
    if (!raw) {
      setNamePreview("")
      setNamePreviewLoading(false)
      return
    }
    const currentLng = i18n.language === "en" ? "en" : "vi"
    const target: "vi" | "en" = currentLng === "en" ? "vi" : "en"
    let cancelled = false
    setNamePreviewLoading(true)
    const tmr = window.setTimeout(() => {
      translateText(raw, target)
        .then((translated) => {
          if (cancelled) return
          setNamePreview(translated)
        })
        .catch(() => {
          if (cancelled) return
          setNamePreview("")
        })
        .finally(() => {
          if (cancelled) return
          setNamePreviewLoading(false)
        })
    }, 450)
    return () => {
      cancelled = true
      window.clearTimeout(tmr)
    }
  }, [i18n.language, nameValue])

  const extractCategoryList = (payload: unknown): CategoryApiItem[] => {
    if (Array.isArray(payload)) {
      return payload as CategoryApiItem[]
    }

    const candidate = payload as Record<string, unknown>
    const listCandidate = [candidate.categories, candidate.items, candidate.results, candidate.data].find(
      (item) => Array.isArray(item),
    )

    if (Array.isArray(listCandidate)) {
      return listCandidate as CategoryApiItem[]
    }

    const nestedData = candidate.data as unknown
    if (nestedData && typeof nestedData === "object") {
      const nestedCandidate = nestedData as Record<string, unknown>
      const nestedListCandidate = [
        nestedCandidate.categories,
        nestedCandidate.items,
        nestedCandidate.results,
        nestedCandidate.data,
      ].find((item) => Array.isArray(item))
      return Array.isArray(nestedListCandidate) ? (nestedListCandidate as CategoryApiItem[]) : []
    }

    return []
  }

  const normalizeCategoryId = (item: CategoryApiItem & { id?: string }) =>
    String(item._id || item.id || item.categoriesId || "")

  const fetchCategories = async (pageParam = page, pageSizeParam = pageSize, searchParam = search) => {
    try {
      setLoading(true)
      const res = await categoryApi.getCategories({
        page: pageParam,
        limit: pageSizeParam,
        search: searchParam || undefined,
      })
      console.log("[categories] /categories response:", (res as { data?: unknown }).data ?? res)

      const data = (res as { data?: unknown } & Record<string, unknown>).data || res
      const list = extractCategoryList(data)

      const totalValue =
        (data as { total?: number }).total ??
        (typeof (data as { results?: unknown }).results === "number"
          ? ((data as { results?: number }).results as number)
          : undefined) ??
        list.length
      setTotal(totalValue)

      const mapped: CategoryRow[] = list.map((c) => ({
        key: normalizeCategoryId(c) || `category-${c.name}-${c.createdAt || Date.now()}`,
        id: normalizeCategoryId(c),
        name: String(c.name || ""),
        description: String(c.description || ""),
        createdAt: c.createdAt || "",
      }))
      setCategories(mapped)
    } catch (error) {
      console.error("[categories] fetch failed:", error)
      toast.error(t("categories.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories(1, pageSize, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const names = categories.map((c) => c.name).filter(Boolean).slice(0, 30)
    if (names.length === 0) return
    let cancelled = false
    ;(async () => {
      for (const n of names) {
        if (cancelled) return
        await ensureDynamicCategoryTranslation(String(n))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categories])

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const current = pagination.current || 1
    const size = pagination.pageSize || 10
    setPage(current)
    setPageSize(size)
    fetchCategories(current, size, search)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    fetchCategories(1, pageSize, value)
  }

  const openCreateModal = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (row: CategoryRow) => {
    setEditing(row)
    form.setFieldsValue({ name: row.name, description: row.description })
    setModalOpen(true)
  }

  const handleDelete = async (row: CategoryRow) => {
    try {
      await categoryApi.deleteCategory(row.id)
      fetchCategories(page, pageSize, search)
    } catch {
      toast.error(t("categories.deleteFailed"))
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const rawName = String(values?.name ?? "").trim()
      const currentLng = i18n.language === "en" ? "en" : "vi"

      // Persist translations in DB fields when backend supports them.
      if (rawName) {
        if (currentLng === "vi") {
          values.name_vi = rawName
          try {
            values.name_en = await translateText(rawName, "en")
          } catch {}
        } else {
          values.name_en = rawName
          try {
            values.name_vi = await translateText(rawName, "vi")
          } catch {}
        }
      }
      if (editing) {
        await categoryApi.updateCategory(editing.id, values)
      } else {
        await categoryApi.createCategory(values)
      }

      if (rawName) {
        // Fire-and-forget: auto-generate translations for new/edited category names.
        void ensureDynamicCategoryTranslation(rawName)
      }

      setModalOpen(false)
      fetchCategories(page, pageSize, search)
    } catch {
      toast.error(t("categories.saveFailed"))
    }
  }

  const columns: ColumnsType<CategoryRow> = [
    {
      title: t("categories.columns.name"),
      dataIndex: "name",
      render: (value: string) => {
        const preferred = value
        const key = toI18nKey(preferred)
        const dynamic = key ? getDynamicTranslation("categories", key) : undefined
        return dynamic || (key ? t(`categories.values.${key}.name`, preferred) : preferred)
      },
    },
    {
      title: t("categories.columns.description"),
      dataIndex: "description",
      render: (value: string, record) => {
        const key = toI18nKey(record.name)
        return key ? t(`categories.values.${key}.description`, value || "—") : value || "—"
      },
    },
    {
      title: t("categories.columns.createdAt"),
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: t("categories.columns.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openEditModal(record)}>
            {t("common.edit")}
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            {t("common.delete")}
          </Button>
        </Space>
      ),
    },
  ]

  const pagination: PaginationProps = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("categories.title")}</h2>
          <p className="text-muted-foreground">{t("categories.subtitle")}</p>
        </div>
        <Space>
          <Search
            placeholder={t("categories.searchPlaceholder")}
            onSearch={handleSearch}
            allowClear
            style={{ maxWidth: 260 }}
          />
          <Button type="primary" onClick={openCreateModal}>
            {t("categories.new")}
          </Button>
        </Space>
      </div>

      <Table<CategoryRow>
        columns={columns}
        dataSource={categories}
        loading={loading}
        locale={{ emptyText: t("common.noData") as unknown as string }}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="key"
      />

      <Modal
        title={editing ? t("categories.editTitle") : t("categories.newTitle")}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText={t("common.save")}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t("categories.columns.name")}
            rules={[{ required: true, message: t("categories.nameRequired") }]}
          >
            <Input />
          </Form.Item>
          <div className="mb-3">
            <Typography.Text type="secondary" className="text-xs">
              Preview ({i18n.language === "en" ? "VI" : "EN"}):{" "}
              {namePreviewLoading ? "Translating…" : namePreview || "—"}
            </Typography.Text>
          </div>
          <Form.Item name="description" label={t("categories.columns.description")}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
