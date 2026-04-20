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

const registerFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function Register() {
  const { register: registerUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const session = await registerUser(values.fullName, values.email, values.password);
      toast.success("Registration successful");
      const role = resolveUserRole(session.user as unknown as Record<string, unknown>);
      if (role !== "admin") {
        // Admin FE: do not keep non-admin session here.
        logout()
        toast.message("Tài khoản vừa tạo không phải admin. Vui lòng đăng nhập bằng admin (roleID=2).")
        navigate("/login", { replace: true })
        return
      }
      navigate("/system/dashboard-admin", { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="space-y-1 text-center">
          <Typography.Title level={3} className="mb-0!">
            Create an account
          </Typography.Title>
          <Typography.Text type="secondary">
            Enter your details below to create your account
          </Typography.Text>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1">
            <Typography.Text strong>Full Name</Typography.Text>
            <Controller
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <Input {...field} placeholder="John Doe" autoComplete="name" disabled={isLoading} />
              )}
            />
            {form.formState.errors.fullName?.message && (
              <Typography.Text type="danger" className="text-xs">
                {form.formState.errors.fullName.message}
              </Typography.Text>
            )}
          </div>

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
                  autoComplete="new-password"
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
            Register
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
