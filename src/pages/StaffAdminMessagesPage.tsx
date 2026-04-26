import * as React from "react"
import { Send, Headphones, MessageSquare, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { AxiosError } from "axios"
import { cn } from "@/utils/utils"
import { Button, Drawer, Input } from "antd"
import { useStaffAdminChat } from "@/features/teamChat/hooks/useStaffAdminChat"
import { teamChatApi, type TeamMemberRow } from "@/features/teamChat/api/teamChatApi"
import { normalizeApiError } from "@/utils/errors"
import { useIsMobile } from "@/hooks/use-mobile"

export const StaffAdminMessagesPage = () => {
  const isMobile = useIsMobile()
  const [adminList, setAdminList] = React.useState<TeamMemberRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [selectedAdminId, setSelectedAdminId] = React.useState("")
  const [input, setInput] = React.useState("")
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const { messages, isTyping, onlineMap, sendMessage, emitTyping } = useStaffAdminChat(selectedAdminId)

  const endRef = React.useRef<HTMLDivElement>(null)

  const fetchAdminList = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const rows = await teamChatApi.listTeamMembers(2, { suppressErrorToast: true })
      setAdminList(rows)
    } catch (e) {
      setAdminList([])
      setLoadError(normalizeApiError(e as AxiosError<unknown>).message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchAdminList()
  }, [fetchAdminList])

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const selected = React.useMemo(
    () => adminList.find((s) => String(s.userId) === String(selectedAdminId)),
    [adminList, selectedAdminId],
  )

  const onSend = () => {
    const t = input.trim()
    if (!t) return
    if (sendMessage(t)) setInput("")
  }

  const adminPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Headphones className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold leading-tight">Tin nhắn Admin</h2>
          <p className="text-[10px] text-muted-foreground">Danh sách quản trị viên</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading && <p className="px-2 py-3 text-xs text-muted-foreground">Đang tải…</p>}
        {!loading && loadError && (
          <div className="mb-2 space-y-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs">
            <p className="text-destructive">{loadError}</p>
            <p className="text-muted-foreground">
              Kiểm tra đăng nhập và cấu hình API (<code className="rounded bg-muted px-1">VITE_API_URL</code>
              ).
            </p>
            <Button size="small" className="h-8 w-full gap-1.5" onClick={() => void fetchAdminList()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Thử lại
            </Button>
          </div>
        )}
        {!loading &&
          !loadError &&
          adminList.map((a) => {
            const active = String(a.userId) === String(selectedAdminId)
            return (
              <button
                key={a.userId}
                type="button"
                onClick={() => {
                  setSelectedAdminId(String(a.userId))
                  setDrawerOpen(false)
                }}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  active ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <div className="relative shrink-0">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {(a.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  {onlineMap[String(a.userId)] && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{a.name || `Admin #${a.userId}`}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.email}</div>
                </div>
              </button>
            )
          })}
        {!loading && !loadError && adminList.length === 0 && (
          <div className="space-y-2 px-2 py-4 text-xs text-muted-foreground">
            <p>Chưa có tài khoản quản trị viên trong hệ thống.</p>
            <Button
              type="text"
              size="small"
              className="h-8 gap-1.5 px-2"
              onClick={() => void fetchAdminList()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Tải lại
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-[420px] w-full overflow-hidden rounded-xl border border-border bg-card">
      {isMobile ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          size="default"
          styles={{ body: { padding: 0 } }}
        >
          <div className="h-full border-r border-border bg-muted/30">{adminPanel}</div>
        </Drawer>
      ) : (
        <div className="flex w-[280px] shrink-0 flex-col border-r border-border bg-muted/30">
          {adminPanel}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-2">
            {isMobile && (
              <Button size="small" onClick={() => setDrawerOpen(true)}>
                Admin
              </Button>
            )}
            {selectedAdminId ? (
              <>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {(selected?.name?.[0] ?? selectedAdminId[0] ?? "A").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {selected?.name || `Admin #${selectedAdminId}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {onlineMap[String(selectedAdminId)] ? "Đang hoạt động" : "Offline"}
                  </div>
                </div>
              </>
            ) : (
              <div className="min-w-0">
                <div className="truncate font-semibold">Tin nhắn Admin</div>
                <div className="text-xs text-muted-foreground">Chọn admin để bắt đầu</div>
              </div>
            )}
          </div>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            Admin
          </span>
        </div>

        {selectedAdminId ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {messages.map((m, idx) => {
                const fromRole = String(m.from?.role ?? "")
                const content =
                  typeof m.message === "object" && m.message && "content" in m.message
                    ? String((m.message as { content?: string }).content ?? "")
                    : ""
                const mine = fromRole === "staff"
                return (
                  <motion.div
                    key={`${idx}-${m.ts}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("mb-3 flex", mine ? "justify-end" : "justify-start")}
                  >
                    {!mine && (
                      <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        A
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                        mine
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm border border-border bg-muted/50",
                      )}
                    >
                      {content}
                    </div>
                  </motion.div>
                )
              })}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="mr-2 h-8 w-8 shrink-0 rounded-full bg-muted" />
                    <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/40 px-4 py-2">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.3s]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            <div className="shrink-0 border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    emitTyping()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSend()
                  }}
                  placeholder="Nhắn cho admin…"
                  className="flex-1"
                />
                <Button type="primary" onClick={onSend} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <MessageSquare className="h-14 w-14 opacity-40" />
            <p className="text-sm font-medium text-foreground">Chọn admin để nhắn tin</p>
            <p className="max-w-sm text-xs">Hội thoại nội bộ giữa nhân viên và quản trị viên.</p>
          </div>
        )}
      </div>
    </div>
  )
}
