import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, Button, Card, Divider, Input, Select, Typography } from "antd"
import { toast } from "sonner"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  bio: z.string().max(280).optional(),
})

const securitySchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const preferencesSchema = z.object({
  language: z.string().min(1),
  timezone: z.string().min(1),
})

type ProfileValues = z.infer<typeof profileSchema>
type SecurityValues = z.infer<typeof securitySchema>
type PreferencesValues = z.infer<typeof preferencesSchema>

export const AccountSettingsPage = () => {
  const { user } = useAuth()
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = React.useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = React.useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = React.useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      bio: "",
    },
  })

  const securityForm = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const preferencesForm = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: "en",
      timezone: "UTC",
    },
  })

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmitProfile = async (values: ProfileValues) => {
    setIsSavingProfile(true)
    try {
      // Wire this up to the ecommerce /users/me endpoint when available
      console.log("Profile values", values)
      toast.success("Profile information saved")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onSubmitSecurity = async (values: SecurityValues) => {
    setIsSavingSecurity(true)
    try {
      // Wire this up to the ecommerce auth change-password endpoint when available
      console.log("Security values", values)
      toast.success("Password updated")
      securityForm.reset()
    } catch {
      toast.error("Failed to update password")
    } finally {
      setIsSavingSecurity(false)
    }
  }

  const onSubmitPreferences = async (values: PreferencesValues) => {
    setIsSavingPreferences(true)
    try {
      // Persist in user profile or local storage as needed
      console.log("Preferences values", values)
      toast.success("Preferences saved")
    } catch {
      toast.error("Failed to save preferences")
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile information, security, and personal preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <div className="space-y-1">
              <Typography.Text strong>Profile information</Typography.Text>
              <Typography.Text type="secondary">
                Update your avatar, contact details, and short bio.
              </Typography.Text>
            </div>
            <div className="mt-4 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar size={64} src={avatarPreview ?? undefined}>
                  {initials}
                </Avatar>
                <div className="space-y-2">
                  <Typography.Text strong className="text-sm">
                    Avatar
                  </Typography.Text>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="max-w-xs cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG or JPG, up to 5MB. This is a local preview; connect to storage when ready.
                  </p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Typography.Text strong>Name</Typography.Text>
                    <Input {...profileForm.register("name")} />
                    {profileForm.formState.errors.name?.message && (
                      <Typography.Text type="danger" className="text-xs">
                        {profileForm.formState.errors.name.message}
                      </Typography.Text>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Typography.Text strong>Email</Typography.Text>
                    <Input type="email" {...profileForm.register("email")} />
                    {profileForm.formState.errors.email?.message && (
                      <Typography.Text type="danger" className="text-xs">
                        {profileForm.formState.errors.email.message}
                      </Typography.Text>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Typography.Text strong>Phone</Typography.Text>
                    <Input placeholder="+1 (555) 000-0000" {...profileForm.register("phone")} />
                    {profileForm.formState.errors.phone?.message && (
                      <Typography.Text type="danger" className="text-xs">
                        {profileForm.formState.errors.phone.message}
                      </Typography.Text>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Typography.Text strong>Bio</Typography.Text>
                  <Input.TextArea
                    placeholder="Tell other admins a little about yourself."
                    {...profileForm.register("bio")}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                  {profileForm.formState.errors.bio?.message && (
                    <Typography.Text type="danger" className="text-xs">
                      {profileForm.formState.errors.bio.message}
                    </Typography.Text>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => profileForm.reset()} disabled={isSavingProfile}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isSavingProfile}>
                    Save changes
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <div className="space-y-1">
              <Typography.Text strong>Security</Typography.Text>
              <Typography.Text type="secondary">
                Change your password and manage sign-in security.
              </Typography.Text>
            </div>
            <div className="mt-4 space-y-6">
              <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-4">
                <div className="space-y-1">
                  <Typography.Text strong>Current password</Typography.Text>
                  <Input.Password
                    autoComplete="current-password"
                    {...securityForm.register("currentPassword")}
                  />
                  {securityForm.formState.errors.currentPassword?.message && (
                    <Typography.Text type="danger" className="text-xs">
                      {securityForm.formState.errors.currentPassword.message}
                    </Typography.Text>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Typography.Text strong>New password</Typography.Text>
                    <Input.Password autoComplete="new-password" {...securityForm.register("newPassword")} />
                    {securityForm.formState.errors.newPassword?.message && (
                      <Typography.Text type="danger" className="text-xs">
                        {securityForm.formState.errors.newPassword.message}
                      </Typography.Text>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Typography.Text strong>Confirm password</Typography.Text>
                    <Input.Password
                      autoComplete="new-password"
                      {...securityForm.register("confirmPassword")}
                    />
                    {securityForm.formState.errors.confirmPassword?.message && (
                      <Typography.Text type="danger" className="text-xs">
                        {securityForm.formState.errors.confirmPassword.message}
                      </Typography.Text>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => securityForm.reset()} disabled={isSavingSecurity}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isSavingSecurity}>
                    Change password
                  </Button>
                </div>
              </form>

              <Divider className="my-0" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Button size="small" disabled>
                    Coming soon
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active sessions</p>
                  <p className="text-xs text-muted-foreground">
                    View and manage where you&apos;re currently signed in.
                  </p>
                  <div className="rounded-lg border border-border/50 bg-muted/40 p-3 text-xs text-muted-foreground">
                    Session management will appear here once connected to the backend.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
            <div className="space-y-1">
              <Typography.Text strong>Preferences</Typography.Text>
              <Typography.Text type="secondary">
                Choose your language, timezone, and other personal preferences.
              </Typography.Text>
            </div>
            <div className="mt-4">
              <form onSubmit={preferencesForm.handleSubmit(onSubmitPreferences)} className="space-y-4">
                <div className="space-y-1">
                  <Typography.Text strong>Language</Typography.Text>
                  <Select
                    value={preferencesForm.watch("language")}
                    onChange={(v) => preferencesForm.setValue("language", v, { shouldValidate: true })}
                    options={[
                      { value: "en", label: "English" },
                      { value: "vi", label: "Vietnamese" },
                      { value: "es", label: "Spanish" },
                    ]}
                  />
                  {preferencesForm.formState.errors.language?.message && (
                    <Typography.Text type="danger" className="text-xs">
                      {preferencesForm.formState.errors.language.message}
                    </Typography.Text>
                  )}
                </div>

                <div className="space-y-1">
                  <Typography.Text strong>Timezone</Typography.Text>
                  <Select
                    value={preferencesForm.watch("timezone")}
                    onChange={(v) => preferencesForm.setValue("timezone", v, { shouldValidate: true })}
                    options={[
                      { value: "UTC", label: "UTC" },
                      { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho Chi Minh" },
                      { value: "America/New_York", label: "America/New York" },
                      { value: "Europe/London", label: "Europe/London" },
                    ]}
                  />
                  {preferencesForm.formState.errors.timezone?.message && (
                    <Typography.Text type="danger" className="text-xs">
                      {preferencesForm.formState.errors.timezone.message}
                    </Typography.Text>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button onClick={() => preferencesForm.reset()} disabled={isSavingPreferences}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isSavingPreferences}>
                    Save changes
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
