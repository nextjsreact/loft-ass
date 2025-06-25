import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import Link from "next/link"

export default async function TeamsPage() {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const teams = await sql`
    SELECT t.*, 
           u.full_name as created_by_name,
           COUNT(tm.user_id) as member_count,
           COUNT(CASE WHEN tk.status IN ('todo', 'in_progress') THEN 1 END) as active_tasks
    FROM teams t
    LEFT JOIN users u ON t.created_by = u.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN tasks tk ON t.id = tk.team_id
    GROUP BY t.id, t.name, t.description, t.created_by, t.created_at, t.updated_at, u.full_name
    ORDER BY t.created_at DESC
  `

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage your teams and members</p>
        </div>
        {session.user.role === "admin" && (
          <Button asChild>
            <Link href="/teams/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: {
          id: string
          name: string
          description?: string
          created_by_name: string
          member_count: string
          active_tasks: string
        }) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>Created by {team.created_by_name}</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{Number.parseInt(team.member_count)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.description && <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Tasks:</span>
                  <Badge variant="secondary">{Number.parseInt(team.active_tasks)}</Badge>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teams/${team.id}`}>View</Link>
                </Button>
                {session.user.role === "admin" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/teams/${team.id}/edit`}>Edit</Link>
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
