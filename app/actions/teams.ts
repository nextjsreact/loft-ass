"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"

export async function createTeam(formData: FormData) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  const data = Object.fromEntries(formData)
  try {
    const [newTeam] = await sql`
      INSERT INTO teams (name, description, created_by)
      VALUES (
        ${data.name.toString().trim()},
        ${data.description?.toString().trim() || null},
        ${session.user.id}
      )
      RETURNING *
    `
    return { success: true, team: newTeam }
  } catch (error) {
    console.error("Failed to create team:", error)
    return { error: error instanceof Error ? error.message : "Failed to create team" }
  }
}

export async function updateTeam(id: string, formData: FormData) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  const data = Object.fromEntries(formData)
  try {
    const [updatedTeam] = await sql`
      UPDATE teams SET
        name = ${data.name.toString().trim()},
        description = ${data.description?.toString().trim() || null}
      WHERE id = ${id}
      RETURNING *
    `
    return { success: true, team: updatedTeam }
  } catch (error) {
    console.error("Failed to update team:", error)
    return { error: error instanceof Error ? error.message : "Failed to update team" }
  }
}

export async function deleteTeam(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`DELETE FROM teams WHERE id = ${id}`
    redirect("/teams")
  } catch (error) {
    console.error("Failed to delete team:", error)
    return { error: error instanceof Error ? error.message : "Failed to delete team" }
  }
}

export async function getTeam(id: string) {
  await ensureSchema()
  
  try {
    const [team] = await sql`
      SELECT * FROM teams WHERE id = ${id}
    `
    return team || null
  } catch (error) {
    console.error("Error fetching team:", error)
    return null
  }
}
