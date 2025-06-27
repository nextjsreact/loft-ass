"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"
import { transactionSchema } from "@/lib/validations"
import type { Transaction } from "@/lib/types"

export async function getTransactions() {
  await ensureSchema()
  const transactions = await sql`SELECT * FROM transactions ORDER BY date DESC`
  return transactions
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  await ensureSchema()
  try {
    const result = await sql`
      SELECT * FROM transactions WHERE id = ${id}
    `
    return (result[0] as Transaction) || null
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}

export async function createTransaction(data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = transactionSchema.parse(data)

  try {
    const result = await sql`
      INSERT INTO transactions (
        amount,
        transaction_type,
        status,
        description,
        date,
        category
      ) VALUES (
        ${validatedData.amount},
        ${validatedData.transaction_type},
        ${validatedData.status},
        ${validatedData.description},
        ${validatedData.date},
        ${validatedData.category}
      )
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to create transaction")
    }

    console.log("Successfully created transaction with ID:", result[0].id)
    redirect("/transactions")
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

export async function updateTransaction(id: string, data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = transactionSchema.parse(data)

  try {
    const result = await sql`
      UPDATE transactions SET
        amount = ${validatedData.amount},
        transaction_type = ${validatedData.transaction_type},
        status = ${validatedData.status},
        description = ${validatedData.description},
        date = ${validatedData.date},
        category = ${validatedData.category},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to update transaction")
    }

    redirect(`/transactions/${id}`)
  } catch (error) {
    console.error("Error updating transaction:", error)
    throw error
  }
}

export async function deleteTransaction(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    await sql`DELETE FROM transactions WHERE id = ${id}`
    redirect("/transactions")
  } catch (error) {
    console.error("Error deleting transaction:", error)
    throw error
  }
}