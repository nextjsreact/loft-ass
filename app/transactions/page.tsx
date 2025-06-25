import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function TransactionsPage() {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const transactions = await sql`
    SELECT t.*, 
           l.name as loft_name,
           u.full_name as user_name
    FROM transactions t
    LEFT JOIN lofts l ON t.loft_id = l.id
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
    LIMIT 50
  `

  const summary = await sql`
    SELECT 
      SUM(CASE WHEN transaction_type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN transaction_type = 'expense' AND status = 'completed' THEN ABS(amount) ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
    FROM transactions
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  `

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "income" ? "text-green-600" : "text-red-600"
  }

  const monthlyStats = summary[0]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track income and expenses</p>
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

      {/* Monthly Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${Number.parseFloat(monthlyStats.total_income || "0").toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${Number.parseFloat(monthlyStats.total_expenses || "0").toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge variant="secondary">{Number.parseInt(monthlyStats.pending_count || "0")}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                Number.parseFloat(monthlyStats.total_income || "0") -
                Number.parseFloat(monthlyStats.total_expenses || "0")
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Net Income</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((transaction: {
          id: string
          transaction_type: string
          amount: string
          status: string
          description?: string
          loft_name?: string
          user_name?: string
          created_at: string
        }) => (
          <Card key={transaction.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${getTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === "income" ? "+" : "-"}$
                      {Math.abs(Number.parseFloat(transaction.amount)).toLocaleString()}
                    </span>
                    <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                  </div>
                  <p className="text-sm font-medium">{transaction.description || "No description"}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">{transaction.transaction_type}</span>
                    {transaction.loft_name && <span>• {transaction.loft_name}</span>}
                    {transaction.user_name && <span>• {transaction.user_name}</span>}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{format(new Date(transaction.created_at), "MMM d, yyyy")}</p>
                  <p>{format(new Date(transaction.created_at), "h:mm a")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
