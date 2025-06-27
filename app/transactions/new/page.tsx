'use client'

import { TransactionForm } from '@/components/forms/transaction-form'
import { createTransaction } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { getLofts } from '@/app/actions/lofts'
import { TransactionFormData } from '@/lib/validations'
import { useState, useEffect } from 'react'

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Loft {
  id: string;
  name: string;
}

export default function NewTransactionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [lofts, setLofts] = useState<Loft[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
    getLofts().then(setLofts)
  }, [])

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      await createTransaction(data)
    } catch (error) {
      console.error(error)
      // Handle error state in the form
    } finally {
      setIsSubmitting(false)
    }
  }

  return <TransactionForm categories={categories} lofts={lofts} onSubmit={handleCreateTransaction} isSubmitting={isSubmitting} />
}
