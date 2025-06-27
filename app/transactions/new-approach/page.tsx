"use client"

import { NewTransactionForm } from "@/components/forms/new-transaction-form"
import { createNewTransaction } from "@/app/actions/new-transactions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function NewTransactionPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: any) => {
    try {
      const result = await createNewTransaction(data)
      if (result?.success) {
        toast({
          title: "Success",
          description: "Transaction created successfully",
        })
        router.push("/transactions")
      } else if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create transaction",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Transaction</h1>
      <NewTransactionForm onSubmit={handleSubmit} />
    </div>
  )
}
