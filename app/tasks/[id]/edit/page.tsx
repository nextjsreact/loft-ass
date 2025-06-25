import { TaskForm } from "@/components/forms/task-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { sql } from "@/lib/database"
import { getTask, updateTask } from "@/app/actions/tasks"

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  due_date?: string
  assigned_to?: string
  team_id?: string
  loft_id?: string
}

export default async function TaskEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id)
  
  if (!task) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Not Found</h1>
          <p className="text-muted-foreground">Could not find task with ID {id}</p>
        </div>
      </div>
    )
  }

  // Fetch required data for the form
  const [users, teams, lofts] = await Promise.all([
    sql`SELECT id, full_name, role FROM users ORDER BY full_name`,
    sql`SELECT id, name FROM teams ORDER BY name`,
    sql`SELECT id, name, address FROM lofts ORDER BY name`
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
          <p className="text-muted-foreground">Updating task {id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Update task information below</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm 
            task={task}
            users={users}
            teams={teams}
            lofts={lofts}
            action={updateTask.bind(null, id)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
