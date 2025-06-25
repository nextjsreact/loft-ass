"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Task, User, Team, Loft } from "@/lib/database"

interface TaskFormProps {
  task?: Task
  users: User[]
  teams: Team[]
  lofts: Loft[]
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>
}

export function TaskForm({ task, users, teams, lofts, action }: TaskFormProps) {
  const [error, setError] = useState("")
  const router = useRouter()
  const { pending } = useFormStatus()

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error || "An unknown error occurred")
      } else {
        router.refresh()
        router.push("/tasks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? "Edit Task" : "Add New Task"}</CardTitle>
        <CardDescription>{task ? "Update task information" : "Create a new task"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              name="title" 
              defaultValue={task?.title || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description"
              defaultValue={task?.description || ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={task?.status || "todo"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input 
                id="due_date" 
                type="date" 
                name="due_date"
                defaultValue={task?.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select name="assigned_to" defaultValue={task?.assigned_to || "unassigned"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_id">Team</Label>
              <Select name="team_id" defaultValue={task?.team_id || "no_team"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_team">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loft_id">Related Loft</Label>
            <Select name="loft_id" defaultValue={task?.loft_id || "no_loft"}>
              <SelectTrigger>
                <SelectValue placeholder="Select loft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_loft">No loft</SelectItem>
                {lofts.map((loft) => (
                  <SelectItem key={loft.id} value={loft.id}>
                    {loft.name} - {loft.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
