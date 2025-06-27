import { requireRole } from "@/lib/auth"
import { getTransactions } from "@/app/actions/transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function TransactionsPage() {
  const session = await requireRole(["admin", "manager"])
  const transactions = await getTransactions()

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your financial transactions</p>
        </div>
        {session.user.role === "admin" && (
          <Button asChild>
            <Link href="/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{transaction.description}</CardTitle>
                  <CardDescription>{new Date(transaction.date).toLocaleDateString()}</CardDescription>
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
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/transactions/${transaction.id}`}>View</Link>
                </Button>
                {session.user.role === "admin" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/transactions/${transaction.id}/edit`}>Edit</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}