import { requireRole } from "@/lib/auth"
import { getTask, deleteTask } from "@/app/actions/tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function TaskPage({ params }: { params: { id: string } }) {
  const session = await requireRole(["admin", "manager"])
  const task = await getTask(params.id)

  if (!task) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription>{task.due_date ? `Due by ${new Date(task.due_date).toLocaleDateString()}` : "No due date"}</CardDescription>
            </div>
            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{task.description}</p>
          <div className="mt-6 flex gap-4">
            {session.user.role === "admin" && (
              <form action={async () => { "use server"; await deleteTask(task.id) }}>
                <Button variant="destructive">Delete</Button>
              </form>
            )}
            <Button asChild variant="outline">
              <Link href={`/tasks/${task.id}/edit`}>Edit Task</Link>
            </Button>
            <Button asChild>
              <Link href="/tasks">Back to Tasks</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
