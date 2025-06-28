import { requireAuth } from "@/lib/auth"
import { sql, ensureSchema, testDatabaseConnection } from "@/lib/database"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { Task as BaseTask } from "@/lib/types"

interface RecentTask extends BaseTask {
  assigned_user_name: string | null;
  loft_name: string | null;
  due_date?: Date;
}

export default async function DashboardPage() {
  const session = await requireAuth()
  
  // Test database connection first
  const isConnected = await testDatabaseConnection()
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.full_name}</p>
        </div>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Database Connection Error</h3>
            <p className="text-red-600 mb-4">Unable to connect to the database. Please check your configuration.</p>
            <div className="text-sm text-red-500 text-left">
              <p className="font-medium mb-2">Troubleshooting steps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify DATABASE_URL in your .env file</li>
                <li>Check your Neon database status</li>
                <li>Ensure network connectivity</li>
                <li>Restart the development server</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  try {
    await ensureSchema()

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
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      assigned_user: task.assigned_user_name ? { full_name: task.assigned_user_name } : null,
      loft: task.loft_name ? { name: task.loft_name } : null,
    })) as RecentTask[]

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
    console.error('Dashboard error:', error)
    
    // Provide more specific error information
    let errorMessage = 'An unexpected error occurred while loading the dashboard.'
    let troubleshootingSteps: string[] = []
    
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('NeonDbError')) {
        errorMessage = 'Database connection failed. Please check your database configuration.'
        troubleshootingSteps = [
          'Verify your DATABASE_URL in the .env file',
          'Check if your Neon database is active',
          'Ensure you have network connectivity',
          'Try restarting the development server'
        ]
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables are missing. The schema may not be properly initialized.'
        troubleshootingSteps = [
          'Check if database migrations have run',
          'Verify database permissions',
          'Try restarting the application to reinitialize schema'
        ]
      }
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.full_name}</p>
        </div>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            {troubleshootingSteps.length > 0 && (
              <div className="text-sm text-red-500 text-left">
                <p className="font-medium mb-2">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  {troubleshootingSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 p-3 bg-red-100 rounded text-xs text-red-700 text-left">
              <p className="font-medium">Technical details:</p>
              <p className="font-mono break-all">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}