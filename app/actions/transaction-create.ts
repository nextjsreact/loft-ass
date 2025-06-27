"use server"

import { sql } from "@/lib/database"
import { requireRole } from "@/lib/auth"

export async function createTransaction(data: {
  amount: string
  type: string  
  status: string
  description: string
}) {
  console.group('[TRANSACTION CREATION]')
  console.log('Raw input data:', data)
  
  try {
    const parsedData = {
      amount: Number(data.amount),
      type: data.type,
      status: data.status,
      description: data.description
    }
    console.log('Parsed data:', parsedData)

    const result = await sql`
      INSERT INTO transactions (
        amount,
        transaction_type, 
        status,
        description,
        date
      ) VALUES (
        ${parsedData.amount},
        ${parsedData.type},
        ${parsedData.status}, 
        ${parsedData.description},
        NOW()
      )
      RETURNING *
    `

    console.log('Database result:', result[0])
    return { 
      success: true,
      transaction: result[0]
    }
  } catch (error) {
    console.error('Creation failed:', error)
    return { 
      error: error instanceof Error ? error.message : 'Transaction creation failed'
    }
  } finally {
    console.groupEnd()
  }
}
