import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Button, Card, Checkbox, Input, Typography } from "antd"
import { useAuth } from "@/hooks/useAuth"
import { getErrorMessage } from "@/utils/errorUtils"
import { useState } from "react"
import { toast } from "sonner"
import { resolveUserRole } from "@/utils/authRole"

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export const Login = () => {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      const session = await login(values.email, values.password)
      const role = resolveUserRole(session.user as unknown as Record<string, unknown>)
      if (role !== "admin") {
        toast.error("Chỉ tài khoản admin (roleID=2) mới vào được trang admin.")
        logout()
        navigate("/login", { replace: true })
        return
      }
      navigate("/system/dashboard-admin", { replace: true })
      toast.success("Login successful")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="auth-card w-full">
      <div className="px-10 pt-16 pb-12">
        <div className="auth-kicker text-xs tracking-[0.24em] uppercase">Sign In</div>
        <Typography.Title level={2} className="auth-title mb-0! mt-3">
          Access your workspace
        </Typography.Title>
        <Typography.Paragraph className="auth-subtitle mt-2 mb-0!">
          Enter your email below to login to your account.
        </Typography.Paragraph>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
                  autoComplete="current-password"
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

          <div className="flex items-center justify-between gap-6">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isLoading}
              className="auth-checkbox"
            >
              Remember me
            </Checkbox>
            <button type="button" className="auth-link" disabled={isLoading}>
              Forgot password?
            </button>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            className="auth-primary-btn w-full"
            loading={isLoading}
            size="large"
          >
            Login to Workspace
          </Button>

          <p className="text-center auth-footnote">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Card>
  )
}
