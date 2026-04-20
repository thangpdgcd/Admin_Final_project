import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Card, Input, Typography } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errorUtils";
import { useState } from "react";
import { toast } from "sonner";
import { resolveUserRole } from "@/utils/authRole";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const session = await login(values.email, values.password);
      const role = resolveUserRole(session.user as unknown as Record<string, unknown>);
      if (role !== "admin") {
        toast.error("Chỉ tài khoản admin (roleID=2) mới vào được trang admin.")
        logout()
        navigate("/login", { replace: true })
        return
      }
      navigate("/system/dashboard-admin", { replace: true });
      toast.success("Login successful");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="space-y-1 text-center">
          <Typography.Title level={3} className="mb-0!">
            Welcome back
          </Typography.Title>
          <Typography.Text type="secondary">
            Enter your email below to login to your account
          </Typography.Text>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1">
            <Typography.Text strong>Email</Typography.Text>
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              )}
            />
            {form.formState.errors.email?.message && (
              <Typography.Text type="danger" className="text-xs">
                {form.formState.errors.email.message}
              </Typography.Text>
            )}
          </div>

          <div className="space-y-1">
            <Typography.Text strong>Password</Typography.Text>
            <Controller
              control={form.control}
              name="password"
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              )}
            />
            {form.formState.errors.password?.message && (
              <Typography.Text type="danger" className="text-xs">
                {form.formState.errors.password.message}
              </Typography.Text>
            )}
          </div>

          <Button type="primary" htmlType="submit" className="w-full" loading={isLoading}>
            Login
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
