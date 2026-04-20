import * as React from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, type Resolver, useForm } from "react-hook-form"
import { Button, Checkbox, Input, Modal, Select, Typography } from "antd"
import { voucherService, type PromoVoucher } from "@/services/voucher.service"
import { toast } from "sonner"

const coerceNumber = (raw: unknown) => {
  if (raw == null) return raw
  if (typeof raw === "string" && raw.trim() === "") return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

const coerceNullableNumber = (raw: unknown) => {
  if (raw == null) return null
  if (typeof raw === "string" && raw.trim() === "") return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

const schema = z
  .object({
    code: z.string().trim().min(3, "Code is required").max(64),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.preprocess(coerceNumber, z.number().positive("discountValue must be > 0")),
    minOrderValue: z.preprocess(coerceNullableNumber, z.number().min(0).nullable()).optional(),
    maxDiscountValue: z.preprocess(coerceNullableNumber, z.number().positive().nullable()).optional(),
    quantity: z.preprocess(coerceNumber, z.number().int().min(0, "quantity must be >= 0")),
    startDate: z.string().min(1, "startDate is required"),
    endDate: z.string().min(1, "endDate is required"),
    isActive: z.boolean().default(true),
    applicableUsers: z.enum(["all", "new_user", "specific"]),
    specificUsers: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const s = new Date(v.startDate).getTime()
    const e = new Date(v.endDate).getTime()
    if (!Number.isFinite(s)) ctx.addIssue({ code: "custom", path: ["startDate"], message: "Invalid startDate" })
    if (!Number.isFinite(e)) ctx.addIssue({ code: "custom", path: ["endDate"], message: "Invalid endDate" })
    if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "endDate must be after startDate" })
    }
    if (v.discountType === "percentage") {
      if (v.discountValue > 100) {
        ctx.addIssue({ code: "custom", path: ["discountValue"], message: "percentage must be <= 100" })
      }
      if (v.maxDiscountValue == null || !(v.maxDiscountValue > 0)) {
        ctx.addIssue({ code: "custom", path: ["maxDiscountValue"], message: "maxDiscountValue is required for percentage" })
      }
    }
    if (v.applicableUsers === "specific") {
      const ids = String(v.specificUsers ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
      if (ids.length === 0) {
        ctx.addIssue({ code: "custom", path: ["specificUsers"], message: "Provide at least one userId (comma-separated)" })
      }
    }
  })

type FormValues = z.infer<typeof schema>

const toLocalInput = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d
  if (Number.isNaN(dt.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export const VoucherFormModal = ({
  open,
  onOpenChange,
  initial,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: PromoVoucher | null
  onSuccess: () => void
}) => {
  const isEdit = initial != null
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      code: "",
      discountType: "fixed",
      discountValue: 1,
      minOrderValue: null,
      maxDiscountValue: null,
      quantity: 0,
      startDate: toLocalInput(new Date()),
      endDate: toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      isActive: true,
      applicableUsers: "all",
      specificUsers: "",
    },
  })

  React.useEffect(() => {
    if (!open) return
    if (!initial) {
      form.reset({
        code: "",
        discountType: "fixed",
        discountValue: 1,
        minOrderValue: null,
        maxDiscountValue: null,
        quantity: 0,
        startDate: toLocalInput(new Date()),
        endDate: toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        isActive: true,
        applicableUsers: "all",
        specificUsers: "",
      })
      return
    }
    form.reset({
      code: initial.code,
      discountType: initial.discountType,
      discountValue: initial.discountValue,
      minOrderValue: initial.minOrderValue,
      maxDiscountValue: initial.maxDiscountValue,
      quantity: initial.quantity,
      startDate: toLocalInput(initial.startDate),
      endDate: toLocalInput(initial.endDate),
      isActive: initial.isActive,
      applicableUsers: initial.applicableUsers,
      specificUsers: (initial.specificUsers ?? []).join(","),
    })
  }, [open, initial, form])

  const values = form.watch()

  const submit = async (v: FormValues) => {
    setSubmitting(true)
    try {
      const payload = {
        code: v.code,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minOrderValue: v.minOrderValue ?? null,
        maxDiscountValue: v.maxDiscountValue ?? null,
        quantity: v.quantity,
        startDate: new Date(v.startDate).toISOString(),
        endDate: new Date(v.endDate).toISOString(),
        isActive: v.isActive,
        applicableUsers: v.applicableUsers,
        specificUsers:
          v.applicableUsers === "specific"
            ? String(v.specificUsers ?? "")
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
      }
      if (isEdit) {
        await voucherService.updateAdmin(initial!.id, payload)
        toast.success("Voucher updated")
      } else {
        await voucherService.createAdmin(payload)
        toast.success("Voucher created")
      }
      onSuccess()
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Save failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={isEdit ? "Edit voucher" : "Create voucher"}
      footer={null}
      width={860}
      destroyOnHidden
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <form onSubmit={form.handleSubmit(submit)} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Typography.Text strong>Code</Typography.Text>
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="code"
                        placeholder="SUMMER2026"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Typography.Text strong>Applicable users</Typography.Text>
                <Controller
                  name="applicableUsers"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      options={[
                        { value: "all", label: "All" },
                        { value: "new_user", label: "New users" },
                        { value: "specific", label: "Specific users" },
                      ]}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Typography.Text strong>Discount type</Typography.Text>
                <Controller
                  name="discountType"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      options={[
                        { value: "fixed", label: "Fixed" },
                        { value: "percentage", label: "Percentage" },
                      ]}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Typography.Text strong>Discount value</Typography.Text>
                <Controller
                  name="discountValue"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="discountValue"
                        type="number"
                        step="0.01"
                        value={field.value as unknown as string}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Typography.Text strong>Min order value (optional)</Typography.Text>
                <Controller
                  name="minOrderValue"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="minOrderValue"
                      type="number"
                      step="0.01"
                      value={field.value == null ? "" : (field.value as unknown as string)}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Typography.Text strong>
                  Max discount value {values.discountType === "percentage" ? "" : "(optional)"}
                </Typography.Text>
                <Controller
                  name="maxDiscountValue"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="maxDiscountValue"
                        type="number"
                        step="0.01"
                        value={field.value == null ? "" : (field.value as unknown as string)}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Typography.Text strong>Quantity</Typography.Text>
                <Controller
                  name="quantity"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="quantity"
                        type="number"
                        step="1"
                        value={field.value as unknown as string}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>

              <div className="flex items-end gap-2">
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)}>
                      Active
                    </Checkbox>
                  )}
                />
              </div>
            </div>

            {values.applicableUsers === "specific" && (
              <div className="space-y-1.5">
                <Typography.Text strong>Specific users (comma-separated userIds)</Typography.Text>
                <Controller
                  name="specificUsers"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="specificUsers"
                        placeholder="12, 34, 56"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Typography.Text strong>Start</Typography.Text>
                <Controller
                  name="startDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Typography.Text strong>End</Typography.Text>
                <Controller
                  name="endDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.error ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                    </>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="primary" htmlType="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save"}
                </Button>
              </motion.div>
            </div>
        </form>
      </motion.div>
    </Modal>
  )
}

