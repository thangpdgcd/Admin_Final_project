import { useEffect, useState } from "react";
import { Button, Card, Form, Grid, Input, InputNumber, Modal, Pagination, Popconfirm, Select, Skeleton, Space, Table, Upload } from "antd";
import type { PaginationProps } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { categoryApi } from "@/api/categoryApi";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useProducts, type ProductRow } from "@/hooks/useProducts";
import { getErrorMessage } from "@/lib/errorUtils";
import { useAuth } from "@/hooks/useAuth";
import { MotionHover } from "@/components/motion/MotionHover";

const { Search } = Input;
const { Option } = Select;

interface CategoryOptionApiItem {
  _id?: string;
  id?: string;
  categoriesId?: string | number;
  name?: string;
}

function ProductThumbnail({ sources }: { sources: string[] }) {
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) {
    return (
      <div className="h-10 w-10 rounded-md border border-border/40 bg-muted/30" />
    );
  }

  return (
    <img
      src={src}
      alt="product"
      className="h-10 w-10 rounded-md object-cover"
      onError={() => setIndex((prev) => prev + 1)}
    />
  );
}

async function fileToCompressedBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const maxSide = 1200;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.75) || dataUrl;
}

/** Prices are stored in VND (whole numbers). */
function formatVnd(value: number | undefined | null): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function Products() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { loading, products, total, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [search, setSearch] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const extractCategoryOptions = (payload: unknown): { id: string; name: string }[] => {
    const getListFromRecord = (value: Record<string, unknown>): unknown[] => {
      const listCandidate = [value.categories, value.items, value.results, value.data].find((item) => Array.isArray(item));
      return Array.isArray(listCandidate) ? listCandidate : [];
    };

    let list: unknown[] = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else {
      const candidate = payload as Record<string, unknown>;
      list = getListFromRecord(candidate);
      if (list.length === 0 && candidate.data && typeof candidate.data === "object") {
        list = getListFromRecord(candidate.data as Record<string, unknown>);
      }
    }

    return list
      .map((c) => {
        const item = c as CategoryOptionApiItem;
        return {
          id: String(item._id || item.id || item.categoriesId || ""),
          name: String(item.name || ""),
        };
      })
      .filter((c) => Boolean(c.id));
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories({ limit: 100 });
      console.log("[products] /categories response:", (res as { data?: unknown }).data ?? res);
      setCategories(extractCategoryOptions(res));
    } catch (error) {
      console.error("[products] fetch categories failed:", error);
      toast.error("Failed to load category list");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts({
      page: 1,
      limit: pageSize,
      category: categoryFilter,
      search: search || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const current = pagination.current || 1;
    const size = pagination.pageSize || 10;
    setPage(current);
    setPageSize(size);
    fetchProducts({
      page: current,
      limit: size,
      category: categoryFilter,
      search: search || undefined,
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchProducts({
      page: 1,
      limit: pageSize,
      category: categoryFilter,
      search: value || undefined,
    });
  };

  const handleCategoryFilterChange = (value?: string) => {
    setCategoryFilter(value);
    setPage(1);
    fetchProducts({
      page: 1,
      limit: pageSize,
      category: value,
      search: search || undefined,
    });
  };

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const openEditModal = (row: ProductRow) => {
    const productCategoryId =
      (
        row.raw as ProductRow["raw"] & {
          categoryId?: string | number;
          categoriesId?: string | number;
          category?: { _id?: string; id?: string } | string | number;
        }
      ).categoryId ||
      (
        row.raw as ProductRow["raw"] & {
          categoryId?: string | number;
          categoriesId?: string | number;
          category?: { _id?: string; id?: string } | string | number;
        }
      ).categoriesId ||
      (
        typeof row.raw.category === "object" && row.raw.category
          ? (row.raw.category as { _id?: string; id?: string })._id || (row.raw.category as { _id?: string; id?: string }).id
          : row.raw.category
      );

    setEditing(row);
    form.setFieldsValue({
      name: row.name,
      price: row.price,
      stock: row.stock,
      category:
        (productCategoryId ? String(productCategoryId) : undefined) ||
        categories.find((c) => c.name === row.categoryName)?.id,
    });
    setFileList([]);
    setModalOpen(true);
  };

  const handleDelete = async (row: ProductRow) => {
    try {
      await deleteProduct(row.id);
      toast.success("Deleted successfully");
      fetchProducts({
        page,
        limit: pageSize,
        category: categoryFilter,
        search: search || undefined,
      });
    } catch {
      // handled globally
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const payload: Record<string, unknown> = {
        title: values.name,
        name: values.name,
        price: Number(values.price),
        quantity: Number(values.stock),
        stock: Number(values.stock),
      };

      if (values.category) {
        payload.category = values.category;
        payload.categoryId = values.category;
        payload.categoriesId = values.category;
      }

      const currentUserId = (
        user as typeof user & {
          id?: string | number;
          userId?: string | number;
        }
      )?._id ||
      (
        user as typeof user & {
          id?: string | number;
          userId?: string | number;
        }
      )?.id ||
      (
        user as typeof user & {
          id?: string | number;
          userId?: string | number;
        }
      )?.userId;

      if (!editing && currentUserId) {
        const numericUserId = Number(currentUserId);
        if (Number.isFinite(numericUserId) && numericUserId > 0) {
          payload.userId = numericUserId;
        }
      }

      if (fileList[0]?.originFileObj) {
        const base64Image = await fileToCompressedBase64(fileList[0].originFileObj as File);
        if (base64Image.length > 2_000_000) {
          toast.error("Image is too large. Please choose a smaller file.");
          return;
        }
        payload.image = base64Image;
      }

      if (editing) {
        const editingId = String(
          editing.id ||
            (
              editing.raw as ProductRow["raw"] & {
                productId?: string | number;
                productsId?: string | number;
              }
            ).productId ||
            (
              editing.raw as ProductRow["raw"] & {
                productId?: string | number;
                productsId?: string | number;
              }
            ).productsId ||
            ""
        );
        if (!editingId) {
          toast.error("Missing product id");
          return;
        }
        await updateProduct(editingId, payload);
        toast.success("Updated successfully");
      } else {
        await createProduct(payload);
        toast.success("Created successfully");
      }

      setModalOpen(false);
      fetchProducts({
        page,
        limit: pageSize,
        category: categoryFilter,
        search: search || undefined,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns: ColumnsType<ProductRow> = [
    {
      title: t("products.image", { defaultValue: "Image" }),
      dataIndex: "imageUrl",
      render: (_, record) => <ProductThumbnail sources={record.imageCandidates || []} />,
    },
    {
      title: t("products.name", { defaultValue: "Product Name" }),
      dataIndex: "name",
    },
    {
      title: t("products.category", { defaultValue: "Category" }),
      dataIndex: "categoryName",
    },
    {
      title: t("products.priceVnd", { defaultValue: "Price (VND)" }),
      dataIndex: "price",
      render: (value: number) => formatVnd(value),
    },
    {
      title: t("products.stock", { defaultValue: "Stock" }),
      dataIndex: "stock",
    },
    {
      title: t("common.createdAt", { defaultValue: "Created Date" }),
      dataIndex: "createdAt",
      render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: t("common.actions", { defaultValue: "Actions" }),
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openEditModal(record)}>
            {t("common.edit", { defaultValue: "Edit" })}
          </Button>
          <Popconfirm
            title={t("common.confirmDeleteTitle", { defaultValue: "Delete this item?" })}
            description={t("common.confirmDeleteDesc", { defaultValue: "This action cannot be undone." })}
            okText={t("common.delete", { defaultValue: "Delete" })}
            cancelText={t("common.cancel", { defaultValue: "Cancel" })}
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger>
              {t("common.delete", { defaultValue: "Delete" })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pagination: PaginationProps = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("menu.products", { defaultValue: "Products" })}
          </h2>
          <p className="text-muted-foreground">
            {t("products.subtitle", { defaultValue: "Manage coffee products and menu items." })}
          </p>
        </div>
        <Space>
          <Search
            placeholder={t("products.searchPlaceholder", { defaultValue: "Search products" })}
            onSearch={handleSearch}
            allowClear
            style={{ maxWidth: 260 }}
          />
          <Select
            allowClear
            placeholder={t("products.filterCategory", { defaultValue: "Filter by category" })}
            style={{ minWidth: 180 }}
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            {categories?.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
          <MotionHover>
            <Button type="primary" onClick={openCreateModal}>
              {t("products.new", { defaultValue: "New Product" })}
            </Button>
          </MotionHover>
        </Space>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {loading ? (
            <>
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
            </>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No products found
            </div>
          ) : (
            products.map((p) => (
              <Card key={p.key} size="small" className="rounded-xl border border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductThumbnail sources={p.imageCandidates || []} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{p.categoryName || "—"}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold">{formatVnd(p.price)}</div>
                    <div className="text-xs text-muted-foreground">Stock: {p.stock ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  {p.createdAt ? dayjs(p.createdAt).format("YYYY-MM-DD HH:mm") : "—"}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="small" onClick={() => openEditModal(p)}>
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this item?"
                    description="This action cannot be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDelete(p)}
                  >
                    <Button size="small" danger>
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            ))
          )}

          <div className="pt-2">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              onChange={(p, ps) => {
                const size = ps || pageSize;
                setPage(p);
                setPageSize(size);
                fetchProducts({
                  page: p,
                  limit: size,
                  category: categoryFilter,
                  search: search || undefined,
                });
              }}
            />
          </div>
        </div>
      ) : (
        <Table<ProductRow>
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="key"
        />
      )}

      <Modal
        title={
          editing
            ? t("products.editTitle", { defaultValue: "Edit Product" })
            : t("products.newTitle", { defaultValue: "New Product" })
        }
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText={t("common.save", { defaultValue: "Save" })}
        cancelText={t("common.cancel", { defaultValue: "Cancel" })}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t("products.name", { defaultValue: "Product Name" })}
            rules={[
              { required: true, message: t("products.nameRequired", { defaultValue: "Please enter a product name" }) },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label={t("products.price", { defaultValue: "Price" })}
            rules={[{ required: true, message: t("products.priceRequired", { defaultValue: "Please enter a price" }) }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="stock"
            label={t("products.stock", { defaultValue: "Stock" })}
            rules={[
              { required: true, message: t("products.stockRequired", { defaultValue: "Please enter stock quantity" }) },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="category" label={t("products.category", { defaultValue: "Category" })}>
            <Select allowClear placeholder={t("products.selectCategory", { defaultValue: "Select category" })}>
              {categories?.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="image" label={t("products.image", { defaultValue: "Product Image" })}>
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: newList }) => setFileList(newList)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                {t("products.selectImage", { defaultValue: "Select Image" })}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

