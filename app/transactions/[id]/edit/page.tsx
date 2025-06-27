'use client'

import { TransactionForm } from '@/components/forms/transaction-form'
import { getTransaction, updateTransaction } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { TransactionFormData } from '@/lib/validations'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { Transaction } from '@/lib/types'

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function EditTransactionPage() {
  const params = useParams()
  const id = params.id as string
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      getTransaction(id).then(setTransaction)
    }
    getCategories().then(setCategories)
  }, [id])

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await updateTransaction(id, data)
    } catch (error) {
      console.error(error)
      // Handle error state in the form
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!transaction) return <div>Loading...</div>

  return <TransactionForm transaction={transaction} categories={categories} onSubmit={handleUpdateTransaction} isSubmitting={isSubmitting} />
}

