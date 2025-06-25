"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User, Team, Loft } from "@/lib/database"

export default function TaskEditForm({
  task,
  users,
  teams,
  lofts,
  updateAction
}: {
  task: any
  users: User[]
  teams: Team[]
  lofts: Loft[]
  updateAction: (formData: { [key: string]: any }) => Promise<void>
}) {
  const router = useRouter()

  return (
    <form action={updateAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={task.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={task.description || ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={task.status}>
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
            name="due_date"
            type="date"
            defaultValue={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Select name="assigned_to" defaultValue={task.assigned_to || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users.map((user: User) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team_id">Team</Label>
          <Select name="team_id" defaultValue={task.team_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_team">No team</SelectItem>
              {teams.map((team: Team) => (
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
        <Select name="loft_id" defaultValue={task.loft_id || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Select loft" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_loft">No loft</SelectItem>
            {lofts.map((loft: Loft) => (
              <SelectItem key={loft.id} value={loft.id}>
                {loft.name} - {loft.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit">Update Task</Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push(`/tasks/${task.id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}