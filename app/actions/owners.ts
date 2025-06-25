"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"
import type { LoftOwner } from "@/lib/types"

export async function getOwners(): Promise<LoftOwner[]> {
  await ensureSchema()

  try {
    const result = await sql`
      SELECT * FROM loft_owners
      ORDER BY name ASC
    `
    return result as LoftOwner[]
  } catch (error) {
    console.error("Error fetching owners:", error)
    return []
  }
}

export async function updateOwner(id: string, formData: FormData) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  const data = Object.fromEntries(formData)
  try {
    const [updatedOwner] = await sql`
      UPDATE loft_owners SET
        name = ${data.name.toString().trim()},
        email = ${data.email?.toString().trim() || null},
        phone = ${data.phone?.toString().trim() || null},
        address = ${data.address?.toString().trim() || null},
        ownership_type = ${data.ownership_type?.toString().trim() || 'third_party'}
      WHERE id = ${id}
      RETURNING *
    `
    return { success: true, owner: updatedOwner }
  } catch (error) {
    console.error("Failed to update owner:", error)
    return { error: error instanceof Error ? error.message : "Failed to update owner" }
  }
}

export async function deleteOwner(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`DELETE FROM loft_owners WHERE id = ${id}`
    redirect("/owners")
  } catch (error) {
    console.error("Failed to delete owner:", error)
    return { error: error instanceof Error ? error.message : "Failed to delete owner" }
  }
}

export async function createOwner(formData: FormData) {
  await requireRole(["admin"])
  await ensureSchema()

  const data = Object.fromEntries(formData)
  const name = data.name?.toString().trim()
  
  // Validate required fields
  if (!name) {
    return { error: "Name is required" }
  }

  try {
    const [newOwner] = await sql`
      INSERT INTO loft_owners (
        name, 
        email, 
        phone, 
        address, 
        ownership_type
      ) VALUES (
        ${name},
        ${data.email?.toString().trim() || null},
        ${data.phone?.toString().trim() || null},
        ${data.address?.toString().trim() || null},
        ${data.ownership_type?.toString().trim() || 'third_party'}
      )
      RETURNING *
    `
    return { success: true, owner: newOwner }
  } catch (error) {
    console.error("Failed to create owner:", error)
    return { error: error instanceof Error ? error.message : "Failed to create owner" }
  }
}
