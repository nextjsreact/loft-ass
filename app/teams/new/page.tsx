import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamForm } from "@/components/forms/team-form"
import { createTeam } from "@/app/actions/teams"

export default function NewTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
        <p className="text-muted-foreground">Add a new team to your organization</p>
      </div>

      <TeamForm action={createTeam} />
    </div>
  )
}
