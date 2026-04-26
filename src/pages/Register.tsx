import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Button, Card, Input, Typography } from "antd"
import { useAuth } from "@/hooks/useAuth"
import { getErrorMessage } from "@/utils/errorUtils"
import { useState } from "react"
import { toast } from "sonner"
import { resolveUserRole } from "@/utils/authRole"

const registerFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export const Register = () => {
  const { register: registerUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const session = await registerUser(values.fullName, values.email, values.password)
      toast.success("Registration successful")
      const role = resolveUserRole(session.user as unknown as Record<string, unknown>)
      if (role !== "admin") {
        // Admin FE: do not keep non-admin session here.
        logout()
        toast.message("Tài khoản vừa tạo không phải admin. Vui lòng đăng nhập bằng admin (roleID=2).")
        navigate("/login", { replace: true })
        return
      }
      navigate("/system/dashboard-admin", { replace: true })
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="auth-card w-full">
      <div className="px-10 pt-16 pb-12">
        <div className="auth-kicker text-xs tracking-[0.24em] uppercase">Register</div>
        <Typography.Title level={2} className="auth-title mb-0! mt-3">
          Create an account
        </Typography.Title>
        <Typography.Paragraph className="auth-subtitle mt-2 mb-0!">
          Enter your details below to create your account.
        </Typography.Paragraph>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Typography.Text className="auth-label">Full Name</Typography.Text>
            <Controller
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <Input
                  {...field}
                  className="auth-input"
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isLoading}
                  size="large"
                />
              )}
            />
            {form.formState.errors.fullName?.message && (
              <Typography.Text type="danger" className="auth-error">
                {form.formState.errors.fullName.message}
              </Typography.Text>
            )}
          </div>

          <div className="space-y-2">
            <Typography.Text className="auth-label">Email Address</Typography.Text>
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  className="auth-input"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  size="large"
                />
              )}
            />
            {form.formState.errors.email?.message && (
              <Typography.Text type="danger" className="auth-error">
                {form.formState.errors.email.message}
              </Typography.Text>
            )}
          </div>

          <div className="space-y-2">
            <Typography.Text className="auth-label">Password</Typography.Text>
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => (
                <Input.Password
                  {...field}
                  className="auth-input"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  size="large"
                />
              )}
            />
            {form.formState.errors.password?.message && (
              <Typography.Text type="danger" className="auth-error">
                {form.formState.errors.password.message}
              </Typography.Text>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            className="auth-primary-btn w-full"
            loading={isLoading}
            size="large"
          >
            Create account
          </Button>

          <p className="text-center auth-footnote">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </Card>
  )
}
