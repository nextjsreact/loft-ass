'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, TransactionFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/lib/types'

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Loft {
  id: string;
  name: string;
}

interface TransactionFormProps {
  transaction?: Transaction
  categories: Category[]
  lofts: Loft[]
  onSubmit: (data: TransactionFormData) => Promise<void>
  isSubmitting?: boolean
}

export function TransactionForm({ transaction, categories, lofts, onSubmit, isSubmitting = false }: TransactionFormProps) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ? {
      ...transaction,
      date: transaction.date ? new Date(transaction.date) : undefined,
    } : { status: 'pending', transaction_type: 'income' },
  })

  const transactionType = watch("transaction_type")
  const filteredCategories = categories.filter(c => c.type === transactionType)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
        <CardDescription>{transaction ? 'Update transaction information' : 'Create a new transaction'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Type</Label>
              <Select onValueChange={(value) => setValue('transaction_type', value as any)} defaultValue={transaction?.transaction_type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {errors.transaction_type && <p className="text-sm text-red-500">{errors.transaction_type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={transaction?.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)} defaultValue={transaction?.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="loft">Loft (Optional)</Label>
              <Select onValueChange={(value) => setValue('loft_id', value)} defaultValue={transaction?.loft_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loft" />
                </SelectTrigger>
                <SelectContent>
                  {lofts.map(loft => (
                    <SelectItem key={loft.id} value={loft.id}>{loft.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.loft_id && <p className="text-sm text-red-500">{errors.loft_id.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/transactions')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
