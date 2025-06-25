"use client"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { TaskForm } from "@/components/forms/task-form"
import { createTask } from "@/app/actions/tasks"

export default async function NewTaskPage() {
  await requireRole(["admin", "manager"])
  await ensureSchema()

  const [users, teams, lofts] = await Promise.all([
    sql`SELECT id, full_name, role FROM users ORDER BY full_name`,
    sql`SELECT id, name FROM teams ORDER BY name`,
    sql`SELECT id, name, address FROM lofts ORDER BY name`,
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Task</h1>
        <p className="text-muted-foreground">Create a new task</p>
      </div>

      <TaskForm users={users} teams={teams} lofts={lofts} onSubmit={createTask} />
    </div>
  )
}
