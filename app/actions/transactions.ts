"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"

export async function getTransactions() {
  await ensureSchema()
  return await sql`
    SELECT t.*, l.name as loft_name, u.full_name as user_name
    FROM transactions t
    LEFT JOIN lofts l ON t.loft_id = l.id
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `
}

export async function createTransaction(formData: FormData) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  const data = Object.fromEntries(formData)
  try {
    await sql`
      INSERT INTO transactions (
        amount, description, transaction_type, 
        status, loft_id, user_id
      ) VALUES (
        ${data.amount},
        ${data.description},
        ${data.transaction_type},
        ${data.status || 'pending'},
        ${data.loft_id || null},
        ${data.user_id || null}
      )
    `
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create transaction" }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  const data = Object.fromEntries(formData)
  try {
    await sql`
      UPDATE transactions SET
        amount = ${data.amount},
        description = ${data.description},
        transaction_type = ${data.transaction_type},
        status = ${data.status},
        loft_id = ${data.loft_id || null},
        user_id = ${data.user_id || null}
      WHERE id = ${id}
    `
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update transaction" }
  }
}

export async function deleteTransaction(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`DELETE FROM transactions WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete transaction" }
  }
}
