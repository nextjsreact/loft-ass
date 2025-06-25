import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTeam } from "@/app/actions/teams"
import Link from "next/link"
import { format } from "date-fns"

export default async function TeamViewPage({ params }: { params: { id: string } }) {
  const team = await getTeam(params.id)

  if (!team) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Not Found</h1>
          <p className="text-muted-foreground">Could not find team with ID {params.id}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">Team ID: {team.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/teams/${team.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>Basic information about the team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {team.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="whitespace-pre-wrap">{team.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p>{format(new Date(team.created_at), "PPP")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
