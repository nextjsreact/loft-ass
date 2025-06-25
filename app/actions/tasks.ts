"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"

export async function updateTask(id: string, formData: FormData) {
  const data = Object.fromEntries(formData) as Record<string, string>;
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  try {
    // Ensure title is not empty
    const title = data.title?.toString().trim() || 'Untitled Task'
    
    const result = await sql`
      UPDATE tasks SET
        title = ${title},
        description = ${data.description?.toString().trim() || null},
        status = ${data.status?.toString().trim() || 'todo'},
        due_date = ${data.due_date ? new Date(data.due_date.toString()).toISOString() : null},
        assigned_to = ${data.assigned_to?.toString().trim() || null},
        team_id = ${data.team_id?.toString().trim() || null},
        loft_id = ${data.loft_id?.toString().trim() || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!result || result.length === 0) {
      throw new Error("No rows were updated")
    }
    console.log("Successfully updated task:", result[0])
    return { success: true }
  } catch (error) {
    console.error("Failed to update task:", error)
    return { error: error instanceof Error ? error.message : "Failed to update task" }
  }
}

export async function getTask(id: string) {
  await ensureSchema()

  try {
    const result = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching task:", error)
    return null
  }
}
