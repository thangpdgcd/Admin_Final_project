import * as React from "react"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, CheckCircle2, LayoutGrid, List } from "lucide-react"
import { useTasksStore, type Task, type TaskStatus, type TaskPriority } from "@/store/tasksStore"
import { Button, Card, Input, Modal, Segmented, Select, Table, Tag, Typography } from "antd"
import type { ColumnsType } from "antd/es/table"
import { toast } from "sonner"

type ViewMode = "table" | "kanban"

interface TaskFormState {
  id?: string
  name: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignedTo?: string
  description?: string
}

const EMPTY_FORM: TaskFormState = {
  name: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assignedTo: "",
  description: "",
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const priorityTag = (priority: TaskPriority) => {
  const color = priority === "low" ? "green" : priority === "medium" ? "gold" : "red"
  return <Tag color={color}>{PRIORITY_LABEL[priority]}</Tag>
}

const statusTag = (status: TaskStatus) => {
  const color = status === "done" ? "green" : status === "in_progress" ? "blue" : "default"
  return <Tag color={color}>{STATUS_LABEL[status]}</Tag>
}

const formatDueDate = (value?: string) => {
  if (!value) return "No due date"
  try {
    return format(new Date(value), "PP")
  } catch {
    return value
  }
}

export const TasksPage = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasksStore()
  const [view, setView] = React.useState<ViewMode>("table")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | "all">("all")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [formState, setFormState] = React.useState<TaskFormState>(EMPTY_FORM)

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (statusFilter !== "all" && t.status !== statusFilter) {
        return false
      }
      if (priorityFilter !== "all" && t.priority !== priorityFilter) {
        return false
      }
      return true
    })
  }, [tasks, search, statusFilter, priorityFilter])

  const groupedByStatus = React.useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    }
    for (const t of filteredTasks) {
      groups[t.status].push(t)
    }
    return groups
  }, [filteredTasks])

  const openCreate = () => {
    setFormState(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (task: Task) => {
    setFormState({
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? "",
      assignedTo: task.assignedTo ?? "",
      description: task.description ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formState.name.trim()) {
      toast.error("Task name is required")
      return
    }
    const payload: Omit<Task, "id"> = {
      name: formState.name.trim(),
      status: formState.status,
      priority: formState.priority,
      dueDate: formState.dueDate || undefined,
      assignedTo: formState.assignedTo || undefined,
      description: formState.description || undefined,
    }
    if (formState.id) {
      updateTask(formState.id, payload)
      toast.success("Task updated")
    } else {
      addTask(payload)
      toast.success("Task created")
    }
    setDialogOpen(false)
    setFormState(EMPTY_FORM)
  }

  const handleDelete = React.useCallback(
    (id: string) => {
      deleteTask(id)
      toast.success("Task deleted")
    },
    [deleteTask],
  )

  const handleToggleComplete = React.useCallback(
    (id: string) => {
      toggleComplete(id)
      toast.success("Task status updated")
    },
    [toggleComplete],
  )

  const columns = React.useMemo<ColumnsType<Task>>(
    () => [
      {
        title: "Task",
        key: "task",
        render: (_v, task) => (
          <div className="flex flex-col">
            <span className="font-medium">{task.name}</span>
            {task.description && (
              <span className="truncate text-xs text-muted-foreground">{task.description}</span>
            )}
          </div>
        ),
      },
      { title: "Status", dataIndex: "status", key: "status", render: statusTag },
      { title: "Priority", dataIndex: "priority", key: "priority", render: priorityTag },
      {
        title: "Due date",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (v: string | undefined) => (
          <span className="text-sm text-muted-foreground">{formatDueDate(v)}</span>
        ),
      },
      {
        title: "Assigned to",
        dataIndex: "assignedTo",
        key: "assignedTo",
        render: (v: string | undefined) => (
          <span className="text-sm text-muted-foreground">{v || "Unassigned"}</span>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 140,
        render: (_v, task) => (
          <div className="flex items-center gap-1">
            <Button type="text" onClick={() => handleToggleComplete(task.id)} aria-label="Toggle complete">
              <CheckCircle2
                className={
                  task.status === "done" ? "h-4 w-4 text-emerald-500" : "h-4 w-4 text-muted-foreground"
                }
              />
            </Button>
            <Button type="text" onClick={() => openEdit(task)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="text" danger onClick={() => handleDelete(task.id)} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete, handleToggleComplete],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Lightweight task management for your ecommerce operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={view}
            onChange={(v) => setView(v as ViewMode)}
            options={[
              {
                label: (
                  <span className="inline-flex items-center gap-1">
                    <List className="h-3 w-3" />
                    Table
                  </span>
                ),
                value: "table",
              },
              {
                label: (
                  <span className="inline-flex items-center gap-1">
                    <LayoutGrid className="h-3 w-3" />
                    Board
                  </span>
                ),
                value: "kanban",
              },
            ]}
          />
          <Button type="primary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New task
          </Button>
        </div>
      </div>

      <Card className="border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
        <div className="space-y-1">
          <Typography.Text strong>Task list</Typography.Text>
          <Typography.Text type="secondary">
            Track work across your team with statuses and priorities.
          </Typography.Text>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as TaskStatus | "all")}
              style={{ width: 160 }}
              options={[
                { value: "all", label: "All statuses" },
                { value: "todo", label: "Todo" },
                { value: "in_progress", label: "In progress" },
                { value: "done", label: "Done" },
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v as TaskPriority | "all")}
              style={{ width: 160 }}
              options={[
                { value: "all", label: "All priorities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </div>

          {view === "table" ? (
            <Table<Task>
              rowKey="id"
              columns={columns}
              dataSource={filteredTasks}
              pagination={false}
              locale={{ emptyText: "No tasks found. Create your first task to get started." }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {(["todo", "in_progress", "done"] as TaskStatus[]).map((status) => (
                <div
                  key={status}
                  className="flex min-h-[220px] flex-col rounded-lg border border-border/60 bg-muted/40 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {STATUS_LABEL[status]}
                    </span>
                    <Tag>{groupedByStatus[status].length}</Tag>
                  </div>
                  <div className="flex-1 space-y-2">
                    {groupedByStatus[status].length === 0 ? (
                      <p className="pt-4 text-xs text-muted-foreground">No tasks in this column yet.</p>
                    ) : (
                      groupedByStatus[status].map((task) => (
                        <div
                          key={task.id}
                          className="group cursor-pointer rounded-md border border-border/60 bg-background/80 p-2 text-xs shadow-sm transition-colors hover:bg-background"
                          onClick={() => openEdit(task)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{task.name}</p>
                            {priorityTag(task.priority)}
                          </div>
                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                            <span>{formatDueDate(task.dueDate)}</span>
                            <span>{task.assignedTo || "Unassigned"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        title={formState.id ? "Edit task" : "Create task"}
        onOk={handleSubmit}
        okText={formState.id ? "Save changes" : "Create task"}
        destroyOnHidden
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Typography.Text strong>Task name</Typography.Text>
            <Input
              value={formState.name}
              onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Review new product listings"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Typography.Text strong>Status</Typography.Text>
              <Select
                value={formState.status}
                onChange={(value) => setFormState((s) => ({ ...s, status: value as TaskStatus }))}
                options={[
                  { value: "todo", label: "Todo" },
                  { value: "in_progress", label: "In progress" },
                  { value: "done", label: "Done" },
                ]}
              />
            </div>
            <div className="space-y-1">
              <Typography.Text strong>Priority</Typography.Text>
              <Select
                value={formState.priority}
                onChange={(value) => setFormState((s) => ({ ...s, priority: value as TaskPriority }))}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Typography.Text strong>Due date</Typography.Text>
              <Input
                type="date"
                value={formState.dueDate}
                onChange={(e) => setFormState((s) => ({ ...s, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Typography.Text strong>Assigned user</Typography.Text>
              <Input
                value={formState.assignedTo}
                onChange={(e) => setFormState((s) => ({ ...s, assignedTo: e.target.value }))}
                placeholder="Name or email"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Typography.Text strong>Description</Typography.Text>
            <Input.TextArea
              value={formState.description}
              onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
              placeholder="Optional context for this task."
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
