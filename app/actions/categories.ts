"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  await ensureSchema()
  const categories = await sql`SELECT * FROM categories ORDER BY name`
  return categories
}

export async function createCategory(data: { name: string; description: string; type: string }) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`
      INSERT INTO categories (name, description, type)
      VALUES (${data.name}, ${data.description}, ${data.type})
    `
    revalidatePath("/settings/categories")
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`DELETE FROM categories WHERE id = ${id}`
    revalidatePath("/settings/categories")
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}
