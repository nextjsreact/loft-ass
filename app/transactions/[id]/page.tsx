import { requireRole } from "@/lib/auth"
import { getTransaction, deleteTransaction } from "@/app/actions/transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function TransactionPage({ params }: { params: { id: string } }) {
  const session = await requireRole(["admin", "manager"])
  const transaction = await getTransaction(params.id)

  if (!transaction) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{transaction.description}</CardTitle>
              <CardDescription>On {new Date(transaction.date).toLocaleDateString()}</CardDescription>
            </div>
            <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className={`font-medium ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount}
            </span>
          </div>
          <div className="mt-6 flex gap-4">
            {session.user.role === "admin" && (
              <form action={async () => { "use server"; await deleteTransaction(transaction.id) }}>
                <Button variant="destructive">Delete</Button>
              </form>
            )}
            <Button asChild variant="outline">
              <Link href={`/transactions/${transaction.id}/edit`}>Edit Transaction</Link>
            </Button>
            <Button asChild>
              <Link href="/transactions">Back to Transactions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
