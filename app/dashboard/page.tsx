import { requireAuth } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentTasks } from "@/components/dashboard/recent-tasks"

export default async function DashboardPage() {
  const session = await requireAuth()
  await ensureSchema()

  try {
    const [loftsResult, tasksResult, teamsResult, transactionsResult, recentTasksResult] = await Promise.all([
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'occupied') as occupied FROM lofts`,
      sql`SELECT COUNT(*) as total FROM tasks WHERE status IN ('todo', 'in_progress')`,
      sql`SELECT COUNT(*) as total FROM teams`,
      sql`SELECT COALESCE(SUM(amount), 0) as revenue FROM transactions WHERE transaction_type = 'income' AND status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE)`,
      sql`
        SELECT t.*, u.full_name as assigned_user_name, l.name as loft_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN lofts l ON t.loft_id = l.id
        ORDER BY t.updated_at DESC
        LIMIT 5
      `,
    ])

    const stats = {
      totalLofts: Number.parseInt(loftsResult[0]?.total || "0"),
      occupiedLofts: Number.parseInt(loftsResult[0]?.occupied || "0"),
      activeTasks: Number.parseInt(tasksResult[0]?.total || "0"),
      monthlyRevenue: Number.parseFloat(transactionsResult[0]?.revenue || "0"),
      totalTeams: Number.parseInt(teamsResult[0]?.total || "0"),
    }

    const recentTasks = recentTasksResult.map((task) => ({
      ...task,
      assigned_user: task.assigned_user_name ? { full_name: task.assigned_user_name } : null,
      loft: task.loft_name ? { name: task.loft_name } : null,
    }))

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.full_name}</p>
        </div>

        <StatsCards stats={stats} />

        <div className="grid gap-6 md:grid-cols-2">
          <RevenueChart />
          <RecentTasks tasks={recentTasks} />
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.full_name}</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }
}
