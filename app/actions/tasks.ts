"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"
import type { Task } from "@/lib/types"
import { z } from "zod"
import { taskSchema } from "@/lib/validations"

export async function getTasks() {
  await ensureSchema()
  const tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`
  return tasks
}

export async function getTask(id: string): Promise<Task | null> {
  await ensureSchema()

  try {
    const result = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `
    return result[0] as Task || null
  } catch (error) {
    console.error("Error fetching task:", error)
    return null
  }
}

export async function createTask(data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = taskSchema.parse(data);

  try {
    const result = await sql`
      INSERT INTO tasks (
        title, 
        description, 
        status, 
        due_date,
        assigned_to,
        team_id,
        loft_id,
        created_by
      ) VALUES (
        ${validatedData.title},
        ${validatedData.description},
        ${validatedData.status},
        ${validatedData.due_date},
        ${validatedData.assigned_to},
        ${validatedData.team_id},
        ${validatedData.loft_id},
        ${session.user.id}
      )
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to create task")
    }
    
    console.log('Successfully created task with ID:', result[0].id)
    redirect("/tasks")
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export async function updateTask(id: string, data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = taskSchema.parse(data);

  try {
    const result = await sql`
      UPDATE tasks SET
        title = ${validatedData.title},
        description = ${validatedData.description},
        status = ${validatedData.status},
        due_date = ${validatedData.due_date},
        assigned_to = ${validatedData.assigned_to},
        team_id = ${validatedData.team_id},
        loft_id = ${validatedData.loft_id},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to update task")
    }

    redirect(`/tasks/${id}`)
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export async function deleteTask(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`DELETE FROM tasks WHERE id = ${id}`
    redirect("/tasks")
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}