"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/database"
import { format } from "date-fns"

interface RecentTasksProps {
  tasks: Task[]
}

export function RecentTasks({ tasks }: RecentTasksProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Latest task updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  {task.loft?.name} • {task.assigned_user?.full_name}
                </p>
                {task.due_date && (
                  <p className="text-xs text-muted-foreground">Due: {format(new Date(task.due_date), "MMM d, yyyy")}</p>
                )}
              </div>
              <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
