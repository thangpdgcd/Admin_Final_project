import { Link } from "react-router-dom"
import { Button, Card, Divider, Tag, Typography } from "antd"

const settingLinks = [
  { title: "User Settings", description: "Personal profile and preferences", href: "/settings/user" },
  {
    title: "Account Settings",
    description: "Account details, security, and sessions",
    href: "/settings/account",
  },
  {
    title: "Plans & Billing",
    description: "Subscription, invoices, and billing details",
    href: "/settings/billing",
  },
  {
    title: "Appearance",
    description: "Theme, layout density, and UI preferences",
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    description: "Email and in-app notification rules",
    href: "/settings/notifications",
  },
  {
    title: "Connections",
    description: "Third-party integrations and API access",
    href: "/settings/connections",
  },
]

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure how your ecommerce admin panel behaves across users, billing, appearance, and
          integrations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <div className="space-y-1">
            <Typography.Text strong>Configuration overview</Typography.Text>
            <Typography.Text type="secondary">
              A quick summary of the most important areas of your system configuration.
            </Typography.Text>
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Access control</span>
                  <Tag color="green">Active</Tag>
                </div>
                <p className="text-xs text-muted-foreground">
                  Role-based access for admin, staff, and users is enforced for all protected routes.
                </p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Security</span>
                  <Tag color="blue">Recommended</Tag>
                </div>
                <p className="text-xs text-muted-foreground">
                  JWT authentication with secure API access to the ecommerce backend.
                </p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Billing</span>
                  <Tag color="gold">Trial</Tag>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage Stripe and cash payment configuration from the Plans &amp; Billing section.
                </p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Appearance</span>
                  <Tag>Synced</Tag>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dark and light themes are available for all admins and staff.
                </p>
              </div>
            </div>

            <Divider className="my-2" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Manage core settings</p>
                  <p className="text-xs text-muted-foreground">
                    Jump directly into the most commonly updated settings pages.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link to="/settings/account">
                  <Button className="w-full justify-start">Account settings</Button>
                </Link>
                <Link to="/settings/appearance">
                  <Button className="w-full justify-start">Appearance</Button>
                </Link>
                <Link to="/settings/notifications">
                  <Button className="w-full justify-start">Notifications</Button>
                </Link>
                <Link to="/settings/connections">
                  <Button className="w-full justify-start">Connections</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <div className="space-y-1">
            <Typography.Text strong>Settings navigation</Typography.Text>
            <Typography.Text type="secondary">
              Quick access to all settings sections inside the dashboard.
            </Typography.Text>
          </div>
          <div className="mt-4 space-y-3">
            {settingLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block rounded-lg border border-transparent p-2.5 transition-colors hover:border-border/70 hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Button size="small">Open</Button>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
