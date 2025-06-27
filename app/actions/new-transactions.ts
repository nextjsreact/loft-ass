"use server"

import { sql } from "@/lib/database"
import { requireRole } from "@/lib/auth"
import { z } from "zod"
import { transactionSchema } from "@/lib/validations"

export async function createNewTransaction(data: z.infer<typeof transactionSchema>) {
  const session = await requireRole(["admin"])
  
  console.group('[NEW TRANSACTION ACTION]')
  console.log('Received data:', {
    amount: data.amount,
    type: data.transaction_type,
    status: data.status,
    description: data.description
  })

  try {
    const result = await sql`
      INSERT INTO transactions (
        amount, 
        transaction_type,
        status,
        description,
        date
      ) VALUES (
        ${data.amount},
        ${data.transaction_type},
        ${data.status},
        ${data.description || null},
        ${data.date || new Date()}
      )
      RETURNING *
    `

    console.log('Database result:', result[0])
    return { 
      success: true,
      transaction: result[0]
    }
  } catch (error) {
    console.error('Transaction failed:', error)
    return { 
      error: error instanceof Error ? error.message : 'Transaction failed'
    }
  } finally {
    console.groupEnd()
  }
}
