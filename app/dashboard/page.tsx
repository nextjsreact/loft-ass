import { requireAuth } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { Task as BaseTask } from "@/lib/types" // Import the base Task interface

interface RecentTask extends BaseTask {
  assigned_user_name: string | null;
  loft_name: string | null;
  due_date?: Date; // Ensure due_date is a Date object for this component
}

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

    const recentTasks = recentTasksResult.map((task: BaseTask & { assigned_user_name: string | null; loft_name: string | null; }) => ({
      ...task,
      due_date: task.due_date ? new Date(task.due_date) : undefined, // Convert due_date to Date object
      assigned_user: task.assigned_user_name ? { full_name: task.assigned_user_name } : null,
      loft: task.loft_name ? { name: task.loft_name } : null,
    })) as RecentTask[] // Cast the result to RecentTask[]

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.full_name}</p>
        </div>

        <div>
          <StatsCards stats={stats} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <RevenueChart />
          </div>
          <div className="lg:col-span-3">
            <RecentTasks tasks={recentTasks} />
          </div>
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
