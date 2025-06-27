"use client"

import { CreateForm } from "@/components/transactions/CreateForm"
import { createTransaction } from "@/app/actions/transaction-create"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function NewTransactionTestPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: any) => {
    console.log('Page received form data:', data)
    try {
      const result = await createTransaction(data)
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
      <h1 className="text-3xl font-bold">New Transaction (Test)</h1>
      <CreateForm onSubmit={handleSubmit} />
    </div>
  )
}
