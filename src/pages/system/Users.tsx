"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Plus, Pencil, Trash2, ReceiptText } from "lucide-react"
import { MetricCard } from "@/components/dashboard/cards/MetricCard"
import {
  Avatar,
  Button,
  Card,
  Grid,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  Tag,
  Typography,
  Skeleton,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { MotionHover } from "@/components/motion/MotionHover"
import {
  userService,
  type User,
  type UserRole,
  type CreateUserBody,
  type UpdateUserBody,
} from "@/services/userService"
import { orderService, type OrderEntity } from "@/services/order.service"
import { useAuth } from "@/hooks/useAuth"
import { getErrorMessage } from "@/utils/errorUtils"
import { toast } from "sonner"
import { useUsers } from "@/hooks/useUsers"
import { useTranslation } from "react-i18next"

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "user", label: "User" },
]

const getRoleLabel = (role: UserRole): string => ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return value
  }
}

const readStringFromRecord = (obj: unknown, key: string): string | undefined => {
  if (!obj || typeof obj !== "object") return undefined
  const r = obj as Record<string, unknown>
  const v = r[key]
  if (v === undefined || v === null) return undefined
  return String(v)
}

const readNumberFromRecord = (obj: unknown, key: string): number | undefined => {
  if (!obj || typeof obj !== "object") return undefined
  const r = obj as Record<string, unknown>
  const n = Number(r[key])
  return Number.isFinite(n) ? n : undefined
}

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "staff", "user"]),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
})

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "staff", "user"]),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>
type EditUserFormValues = z.infer<typeof editUserSchema>

const limit = 10

export const Users = () => {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("")
  const [page, setPage] = React.useState(1)
  const [users, setUsers] = React.useState<User[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState<User | null>(null)
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null)
  const [ordersUser, setOrdersUser] = React.useState<User | null>(null)
  const [ordersLoading, setOrdersLoading] = React.useState(false)
  const [userOrders, setUserOrders] = React.useState<OrderEntity[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const usersHook = useUsers()
  const isEditingSelf = Boolean(editUser && currentUser && String(editUser._id) === String(currentUser._id))
  const isEditingAdmin = Boolean(editUser && editUser.role === "admin")
  const cannotChangeRole = isEditingSelf || isEditingAdmin

  const resolveRowUserId = React.useCallback((user: User) => {
    return String(
      (user as User & { id?: string; userId?: string | number; usersId?: string | number })._id ||
        (user as User & { id?: string; userId?: string | number; usersId?: string | number }).id ||
        (user as User & { id?: string; userId?: string | number; usersId?: string | number }).userId ||
        (user as User & { id?: string; userId?: string | number; usersId?: string | number }).usersId ||
        "",
    )
  }, [])

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await userService.getUsers({
        page,
        limit,
        role: (roleFilter as UserRole | "") || undefined,
      })
      setUsers(
        res.users.map((user) => ({
          ...user,
          _id: resolveRowUserId(user),
        })),
      )
      setTotal(res.total)
    } catch (err) {
      setError(getErrorMessage(err))
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, resolveRowUserId])

  React.useEffect(() => {
    if (usersHook.error) {
      setError(usersHook.error)
    }
  }, [usersHook.error])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = React.useMemo(() => {
    if (!search.trim()) return users
    const s = search.toLowerCase()
    return users.filter((u) => u.name.toLowerCase().includes(s))
  }, [users, search])

  const totalPages = Math.ceil(total / limit) || 1

  const formatMoney = (value: unknown) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return "—"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n)
  }

  const openUserOrders = React.useCallback(
    async (user: User) => {
      const userId = resolveRowUserId(user)
      if (!userId) {
        toast.error(t("users.missingUserId"))
        return
      }
      setOrdersUser(user)
      setOrdersLoading(true)
      setUserOrders([])
      try {
        const list = await orderService.getByUserId(userId, {})
        setUserOrders(list)
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setOrdersLoading(false)
      }
    },
    [resolveRowUserId],
  )

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      address: "",
      phoneNumber: "",
    },
  })

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  })

  React.useEffect(() => {
    if (editUser) {
      editForm.reset({
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
      })
    }
  }, [editUser, editForm])

  const onCreateSubmit = async (values: CreateUserFormValues) => {
    setSubmitting(true)
    try {
      await userService.createUser(values as CreateUserBody)
      toast.success(t("users.createdSuccess"))
      setCreateOpen(false)
      createForm.reset()
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const onEditSubmit = async (values: EditUserFormValues) => {
    if (!editUser) return
    setSubmitting(true)
    try {
      const editUserId = resolveRowUserId(editUser)
      if (!editUserId) {
        toast.error(t("users.missingUserId"))
        return
      }
      const body: UpdateUserBody = cannotChangeRole
        ? { name: values.name, email: values.email }
        : { name: values.name, email: values.email, role: values.role }
      await userService.updateUser(editUserId, body)
      toast.success(t("users.updatedSuccess"))
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const onConfirmDelete = async () => {
    if (!deleteUser) return
    setSubmitting(true)
    try {
      const deleteUserId = resolveRowUserId(deleteUser)
      if (!deleteUserId) {
        toast.error(t("users.missingUserId"))
        return
      }
      await userService.deleteUser(deleteUserId)
      toast.success(t("users.deletedSuccess"))
      setDeleteUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const userColumns = React.useMemo<ColumnsType<User>>(
    () => [
      {
        title: "User",
        key: "user",
        render: (_v, user) => (
          <div className="flex items-center gap-3">
            <Avatar size={32}>{getInitials(user.name)}</Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (v: string) => <span className="text-muted-foreground">{v}</span>,
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (v: UserRole) => <Tag>{getRoleLabel(v)}</Tag>,
      },
      {
        title: "Status",
        key: "status",
        render: () => <Tag color="green">Active</Tag>,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v: string) => <span className="text-muted-foreground text-sm">{formatDate(v)}</span>,
      },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_v, user) => (
          <div className="flex items-center gap-1">
            <Button
              type="text"
              onClick={() => void openUserOrders(user)}
              aria-label="Orders"
              disabled={!resolveRowUserId(user)}
            >
              <ReceiptText className="h-4 w-4" />
            </Button>
            <Button
              type="text"
              onClick={() => setEditUser(user)}
              aria-label="Edit"
              disabled={!resolveRowUserId(user)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="text"
              danger
              onClick={() => setDeleteUser(user)}
              aria-label="Delete"
              disabled={!resolveRowUserId(user)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openUserOrders, resolveRowUserId],
  )

  const ordersColumns = React.useMemo<ColumnsType<OrderEntity>>(
    () => [
      {
        title: "Order",
        key: "order",
        render: (_v, o) => (
          <span className="font-medium">
            {readStringFromRecord(o, "orderId") ?? o._id ?? readStringFromRecord(o, "id") ?? "—"}
          </span>
        ),
      },
      {
        title: "Status",
        key: "status",
        render: (_v, o) => <span className="capitalize">{readStringFromRecord(o, "status") ?? "—"}</span>,
      },
      {
        title: "Total",
        key: "total",
        render: (_v, o) =>
          formatMoney(readNumberFromRecord(o, "total_Amount") ?? o.totalAmount ?? o.totalOrderPrice),
      },
      {
        title: "Created",
        key: "created",
        render: (_v, o) =>
          typeof o.createdAt === "string" ? (
            <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
          ) : (
            "—"
          ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("users.title")}</h2>
        <p className="text-muted-foreground">{t("users.manageSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t("users.totalUsers")}
          value={String(total)}
          change=""
          positive={true}
          description={t("users.fromDatabase")}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Input
                placeholder={t("users.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <Select
              style={{ width: 160 }}
              value={roleFilter || "all"}
              onChange={(v) => setRoleFilter(v === "all" ? "" : String(v))}
              options={[
                { value: "all", label: t("users.allRoles") },
                ...ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
              ]}
            />
          </div>
          <MotionHover>
            <Button type="primary" size="small" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("users.addNew")}
            </Button>
          </MotionHover>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 overflow-auto">
          {isMobile ? (
            loading ? (
              <div className="space-y-3">
                <Skeleton active paragraph={{ rows: 3 }} />
                <Skeleton active paragraph={{ rows: 3 }} />
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <Card
                    key={resolveRowUserId(u) || u.email}
                    size="small"
                    className="rounded-xl border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar size={40} src={u.avatar ?? undefined}>
                          {getInitials(u.name)}
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                      <Tag>{getRoleLabel(u.role)}</Tag>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="small" onClick={() => openUserOrders(u)}>
                        <ReceiptText className="mr-2 h-4 w-4" />
                        Orders
                      </Button>
                      <Button size="small" onClick={() => setEditUser(u)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button danger size="small" onClick={() => setDeleteUser(u)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Table<User>
              rowKey={(u) => resolveRowUserId(u) || u.email}
              loading={loading}
              columns={userColumns}
              dataSource={filteredUsers}
              pagination={false}
              locale={{ emptyText: "No users found" }}
            />
          )}
        </div>

        {!loading && total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
            </p>
            <Pagination
              current={page}
              total={total}
              pageSize={limit}
              showSizeChanger={false}
              onChange={(p) => setPage(p)}
              showTotal={() => `Page ${page} of ${totalPages}`}
            />
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        title="Create user"
        footer={null}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary" className="mt-0">
          Add a new user. They can sign in with the email and password you set.
        </Typography.Paragraph>
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Typography.Text strong>Name</Typography.Text>
            <Controller
              control={createForm.control}
              name="name"
              render={({ field }) => <Input placeholder="Full name" {...field} value={field.value ?? ""} />}
            />
            {createForm.formState.errors.name && (
              <Typography.Text type="danger" className="text-xs">
                {createForm.formState.errors.name.message}
              </Typography.Text>
            )}
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Email</Typography.Text>
            <Controller
              control={createForm.control}
              name="email"
              render={({ field }) => (
                <Input type="email" placeholder="email@example.com" {...field} value={field.value ?? ""} />
              )}
            />
            {createForm.formState.errors.email && (
              <Typography.Text type="danger" className="text-xs">
                {createForm.formState.errors.email.message}
              </Typography.Text>
            )}
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Password</Typography.Text>
            <Controller
              control={createForm.control}
              name="password"
              render={({ field }) => <Input.Password placeholder="••••••••" {...field} value={field.value ?? ""} />}
            />
            {createForm.formState.errors.password && (
              <Typography.Text type="danger" className="text-xs">
                {createForm.formState.errors.password.message}
              </Typography.Text>
            )}
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Address</Typography.Text>
            <Controller
              control={createForm.control}
              name="address"
              render={({ field }) => <Input placeholder="Address" {...field} value={field.value ?? ""} />}
            />
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Phone number</Typography.Text>
            <Controller
              control={createForm.control}
              name="phoneNumber"
              render={({ field }) => <Input placeholder="Phone number" {...field} value={field.value ?? ""} />}
            />
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Role</Typography.Text>
            <Select
              value={createForm.watch("role")}
              onChange={(v) => createForm.setValue("role", v as UserRole, { shouldValidate: true })}
              options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
            />
            {createForm.formState.errors.role && (
              <Typography.Text type="danger" className="text-xs">
                {createForm.formState.errors.role.message}
              </Typography.Text>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editUser}
        onCancel={() => setEditUser(null)}
        title="Edit user"
        footer={null}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary" className="mt-0">
          Update user details. Password cannot be changed here.
        </Typography.Paragraph>
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Typography.Text strong>Name</Typography.Text>
            <Controller
              control={editForm.control}
              name="name"
              render={({ field }) => <Input placeholder="Full name" {...field} value={field.value ?? ""} />}
            />
            {editForm.formState.errors.name && (
              <Typography.Text type="danger" className="text-xs">
                {editForm.formState.errors.name.message}
              </Typography.Text>
            )}
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Email</Typography.Text>
            <Controller
              control={editForm.control}
              name="email"
              render={({ field }) => (
                <Input type="email" placeholder="email@example.com" {...field} value={field.value ?? ""} />
              )}
            />
            {editForm.formState.errors.email && (
              <Typography.Text type="danger" className="text-xs">
                {editForm.formState.errors.email.message}
              </Typography.Text>
            )}
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Role</Typography.Text>
            <Select
              disabled={cannotChangeRole}
              value={editForm.watch("role")}
              onChange={(v) => editForm.setValue("role", v as UserRole, { shouldValidate: true })}
              options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
            />
            {cannotChangeRole && (
              <Typography.Text type="secondary" className="text-xs">
                {isEditingSelf
                  ? "You cannot change your own role."
                  : "Admin user roles cannot be changed here."}
              </Typography.Text>
            )}
            {editForm.formState.errors.role && (
              <Typography.Text type="danger" className="text-xs">
                {editForm.formState.errors.role.message}
              </Typography.Text>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteUser}
        onCancel={() => setDeleteUser(null)}
        title="Delete user"
        okText="Delete"
        okButtonProps={{ danger: true, loading: submitting }}
        onOk={onConfirmDelete}
        destroyOnHidden
      >
        <Typography.Text>
          Are you sure you want to delete <b>{deleteUser?.name}</b>? This action cannot be undone.
        </Typography.Text>
      </Modal>

      {/* User Orders modal */}
      <Modal
        open={!!ordersUser}
        onCancel={() => setOrdersUser(null)}
        title={`Orders of ${ordersUser?.name ?? ""}`}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary" className="mt-0">
          All orders belonging to this user.
        </Typography.Paragraph>
        <Table<OrderEntity>
          rowKey={(o) =>
            String(
              readStringFromRecord(o, "orderId") ?? o._id ?? readStringFromRecord(o, "id") ?? Math.random(),
            )
          }
          loading={ordersLoading}
          columns={ordersColumns}
          dataSource={userOrders}
          pagination={false}
          locale={{ emptyText: "No orders" }}
        />
        <div className="flex justify-end pt-3">
          <Button onClick={() => setOrdersUser(null)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
