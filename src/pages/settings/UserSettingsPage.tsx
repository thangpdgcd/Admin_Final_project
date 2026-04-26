import { useAuth } from "@/hooks/useAuth"
import { Button, Card, Input, Typography } from "antd"

export const UserSettingsPage = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">User Settings</h2>
        <p className="text-muted-foreground">
          Manage your personal profile information used across the admin dashboard.
        </p>
      </div>

      <Card className="w-full border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
        <div className="space-y-1">
          <Typography.Text strong>Profile details</Typography.Text>
          <Typography.Text type="secondary">
            Basic information about you that may be visible to other admins and staff.
          </Typography.Text>
        </div>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Typography.Text strong>Name</Typography.Text>
              <Input id="name" defaultValue={user?.name} disabled />
            </div>
            <div className="space-y-2">
              <Typography.Text strong>Email</Typography.Text>
              <Input id="email" type="email" defaultValue={user?.email} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Typography.Text strong>Bio</Typography.Text>
            <Input.TextArea
              id="bio"
              placeholder="Short bio to show in your profile."
              disabled
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button disabled>Cancel</Button>
            <Button type="primary" disabled>
              Save changes
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile editing is available in the Account Settings page.
          </p>
        </div>
      </Card>
    </div>
  )
}
