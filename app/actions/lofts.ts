"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"
import type { Loft } from "@/lib/types"

export async function getLofts() {
  await ensureSchema()
  const lofts = await sql`SELECT id, name FROM lofts ORDER BY name`
  return lofts
}

export async function deleteLoft(id: string) {
  console.log("Attempting to delete loft with ID:", id)
  const session = await requireRole(["admin"])
  console.log("Session verified:", session.user.email)
  await ensureSchema()

  try {
    const result = await sql`DELETE FROM lofts WHERE id = ${id} RETURNING id`
    console.log("Delete result:", result)
    if (!result || result.length === 0) {
      throw new Error("No loft found with that ID")
    }
    console.log("Successfully deleted loft with ID:", id)
    redirect("/lofts")
  } catch (error) {
    console.error("Error deleting loft:", error)
    throw error
  }
}

export async function getLoft(id: string): Promise<Loft | null> {
  await ensureSchema()

  try {
    const result = await sql`
      SELECT l.*, o.name as owner_name
      FROM lofts l
      LEFT JOIN loft_owners o ON l.owner_id = o.id
      WHERE l.id = ${id}
    `
    return result[0] as Loft || null
  } catch (error) {
    console.error("Error fetching loft:", error)
    return null
  }
}

export async function updateLoft(id: string, data: any) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    const result = await sql`
      UPDATE lofts SET
        name = ${data.name},
        description = ${data.description},
        address = ${data.address},
        price_per_month = ${data.price_per_month},
        owner_id = ${data.owner_id},
        company_percentage = ${data.company_percentage},
        owner_percentage = ${data.owner_percentage},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to update loft")
    }

    return result[0].id
  } catch (error) {
    console.error("Error updating loft:", error)
    throw error
  }
}

interface CreateLoftResult {
  success: boolean
  loftId: string
}

export async function createLoft(data: any): Promise<CreateLoftResult> {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    const result = await sql`
      INSERT INTO lofts (
        name, 
        description, 
        address, 
        price_per_month,
        owner_id,
        company_percentage,
        owner_percentage
      ) VALUES (
        ${data.name},
        ${data.description},
        ${data.address},
        ${data.price_per_month},
        ${data.owner_id},
        ${data.company_percentage},
        ${data.owner_percentage}
      )
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to create loft")
    }
    
    console.log('Successfully created loft with ID:', result[0].id)
    return {
      success: true,
      loftId: result[0].id
    }
  } catch (error) {
    console.error("Error creating loft:", error)
    throw error
  }
}
