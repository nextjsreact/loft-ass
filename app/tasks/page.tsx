import { requireAuth } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function TasksPage() {
  const session = await requireAuth()
  await ensureSchema()

  try {
    const tasks = await sql`
      SELECT t.*, 
             u.full_name as assigned_user_name,
             l.name as loft_name,
             tm.name as team_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN lofts l ON t.loft_id = l.id
      LEFT JOIN teams tm ON t.team_id = tm.id
      ORDER BY t.created_at DESC
    `

    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-800"
        case "in_progress":
          return "bg-blue-100 text-blue-800"
        case "todo":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const getPriorityColor = (dueDate: string | null) => {
      if (!dueDate) return ""
      const due = new Date(dueDate)
      const now = new Date()
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return "border-l-4 border-red-500"
      if (diffDays <= 2) return "border-l-4 border-yellow-500"
      return "border-l-4 border-green-500"
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage and track your tasks</p>
          </div>
          {["admin", "manager"].includes(session.user.role) && (
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className={getPriorityColor(task.due_date)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>
                      {task.loft_name && `${task.loft_name} • `}
                      {task.team_name && `${task.team_name} • `}
                      {task.assigned_user_name && `Assigned to ${task.assigned_user_name}`}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {task.description && <p className="text-sm text-muted-foreground mb-4">{task.description}</p>}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {task.due_date && <span>Due: {format(new Date(task.due_date), "MMM d, yyyy")}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tasks/${task.id}`}>View</Link>
                    </Button>
                    {(task.assigned_to === session.user.id || ["admin", "manager"].includes(session.user.role)) && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }
}
