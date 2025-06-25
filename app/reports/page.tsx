import { requireRole } from "@/lib/auth"
import { createAuthenticatedClient } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

export default async function ReportsPage() {
  const session = await requireRole(["admin", "manager"])
  const sql = createAuthenticatedClient(session.token)

  // Fetch financial data by loft
  const loftRevenue = await sql`
    SELECT l.name, 
           COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as revenue,
           COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as expenses
    FROM lofts l
    LEFT JOIN transactions t ON l.id = t.loft_id AND t.status = 'completed'
    GROUP BY l.id, l.name
    ORDER BY revenue DESC
  `

  // Fetch task completion stats
  const taskStats = await sql`
    SELECT status, COUNT(*) as count
    FROM tasks
    GROUP BY status
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

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  }

  const taskChartConfig = {
    todo: {
      label: "To Do",
      color: "hsl(var(--chart-3))",
    },
    in_progress: {
      label: "In Progress",
      color: "hsl(var(--chart-4))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-5))",
    },
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">Comprehensive financial analytics and insights</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Loft</CardTitle>
            <CardDescription>Monthly revenue and expenses per property</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loftRevenue}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current task completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={taskChartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Revenue and expenses over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
                <Bar dataKey="expenses" fill="var(--color-expenses)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {loftRevenue.map((loft) => (
          <Card key={loft.name}>
            <CardHeader>
              <CardTitle className="text-lg">{loft.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue:</span>
                  <span className="font-medium text-green-600">
                    ${Number.parseFloat(loft.revenue).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expenses:</span>
                  <span className="font-medium text-red-600">${Number.parseFloat(loft.expenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Net Profit:</span>
                  <span className="font-bold">
                    ${(Number.parseFloat(loft.revenue) - Number.parseFloat(loft.expenses)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
