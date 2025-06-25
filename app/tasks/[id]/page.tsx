import { sql } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const revalidate = 0 // Disable caching

export default async function TaskView({ params }: { params: { id: string } }) {
  const [task] = await sql`
    SELECT t.*, 
           u.full_name as assigned_user_name,
           l.name as loft_name,
           tm.name as team_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN lofts l ON t.loft_id = l.id
    LEFT JOIN teams tm ON t.team_id = tm.id
    WHERE t.id = ${params.id}
    LIMIT 1
  `

  if (!task) {
    return <div>Task not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        <p className="text-muted-foreground">Task Details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <Badge className={
              task.status === "completed" ? "bg-green-100 text-green-800" :
              task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }>
              {task.status.replace("_", " ")}
            </Badge>
          </div>

          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.due_date && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
              <p>{format(new Date(task.due_date), "MMM d, yyyy")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
