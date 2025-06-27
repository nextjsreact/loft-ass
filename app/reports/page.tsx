import { requireRole } from "@/lib/auth"
import { createAuthenticatedClient } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ReportChartsWrapper from './report-charts-wrapper'

export default async function ReportsPage() {
  const session = await requireRole(["admin", "manager"])
  const sql = createAuthenticatedClient(session.token)

  // Fetch financial data by loft
  const loftRevenue = await sql`
    SELECT 
      l.name, 
      COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as revenue,
      COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as expenses,
      COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE -t.amount END), 0) as net_profit
    FROM lofts l
    LEFT JOIN transactions t ON l.id = t.loft_id AND t.status = 'completed'
    GROUP BY l.id, l.name
    ORDER BY net_profit DESC
  `

  // Fetch monthly revenue trend
  const monthlyRevenue = await sql`
    SELECT 
      TO_CHAR(created_at, 'Mon YYYY') as month,
      SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN transaction_type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses
    FROM transactions
    WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">Comprehensive financial analytics and insights</p>
      </div>

      <ReportChartsWrapper loftRevenue={loftRevenue} monthlyRevenue={monthlyRevenue} />
    </div>
  )
}
