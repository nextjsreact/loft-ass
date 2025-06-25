import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamForm } from "@/components/forms/team-form"
import { getTeam, updateTeam } from "@/app/actions/teams"

export default async function TeamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const team = await getTeam(id)

  if (!team) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Not Found</h1>
          <p className="text-muted-foreground">Could not find team with ID {id}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
        <p className="text-muted-foreground">Update team information</p>
      </div>

      <TeamForm team={team} action={updateTeam.bind(null, id)} />
    </div>
  )
}
