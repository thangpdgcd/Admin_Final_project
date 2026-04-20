import { Button, Card, Checkbox, Typography } from "antd";

export function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Control when and how you receive updates about your store.
        </p>
      </div>

      <Card className="max-w-3xl border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
        <div className="space-y-1">
          <Typography.Text strong>Email notifications</Typography.Text>
          <Typography.Text type="secondary">
            Choose which events should trigger an email to your inbox.
          </Typography.Text>
        </div>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked />
              <div className="space-y-0.5">
                <Typography.Text strong>New orders</Typography.Text>
                <p className="text-xs text-muted-foreground">
                  Receive an email each time a new order is created.
                </p>
              </div>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked />
              <div className="space-y-0.5">
                <Typography.Text strong>Failed payments</Typography.Text>
                <p className="text-xs text-muted-foreground">
                  Alerts when Stripe or cash payments fail to complete.
                </p>
              </div>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm">
              <Checkbox />
              <div className="space-y-0.5">
                <Typography.Text strong>New reviews</Typography.Text>
                <p className="text-xs text-muted-foreground">
                  Get notified when customers leave product reviews.
                </p>
              </div>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="small">
              Cancel
            </Button>
            <Button type="primary" size="small">Save changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

