import { Button, Card, Switch, Typography } from "antd";
import { useTheme } from "next-themes";

export function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">
          Customize how the admin dashboard looks and feels.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1.2fr)]">
        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <div className="space-y-1">
            <Typography.Text strong>Theme</Typography.Text>
            <Typography.Text type="secondary">Switch between light and dark themes.</Typography.Text>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">
                  {isDark ? "Dark mode" : "Light mode"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toggle the global color scheme for this dashboard.
                </p>
              </div>
              <Button
                size="small"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                Use {isDark ? "light" : "dark"} mode
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
          <div className="space-y-1">
            <Typography.Text strong>Layout density</Typography.Text>
            <Typography.Text type="secondary">
              Fine-tune how compact or spacious the interface feels.
            </Typography.Text>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/40 p-3">
              <div className="space-y-0.5">
                <Typography.Text strong>Comfortable</Typography.Text>
                <p className="text-xs text-muted-foreground">
                  Default spacing, best for large screens and long sessions.
                </p>
              </div>
              <Switch aria-label="Comfortable layout" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/40 p-3">
              <div className="space-y-0.5">
                <Typography.Text strong>Compact</Typography.Text>
                <p className="text-xs text-muted-foreground">
                  Tighter layout to fit more information on screen.
                </p>
              </div>
              <Switch aria-label="Compact layout" disabled />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

