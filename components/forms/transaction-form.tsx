"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { transactionSchema } from "@/lib/validations"
import type { TransactionFormData } from "@/lib/validations"

interface TransactionFormProps {
  transaction?: any
  onSubmit: (data: TransactionFormData) => Promise<void>
}

export function TransactionForm({ transaction, onSubmit }: TransactionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction || {
      transaction_type: "expense",
      status: "pending"
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01"
                {...register("amount")}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">Type</Label>
              <Select {...register("transaction_type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select {...register("status")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loft_id">Loft (optional)</Label>
              <Input 
                id="loft_id" 
                {...register("loft_id")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit">
              {transaction ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
