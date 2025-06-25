import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { sql } from "@/lib/database"
import { format } from "date-fns"
import { DeleteOwnerButton } from "./delete-button"

export default async function OwnerViewPage({ params }: { params: { id: string } }) {
  const [owner] = await sql`
    SELECT * FROM loft_owners WHERE id = ${params.id}
  `

  if (!owner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Not Found</h1>
          <p className="text-muted-foreground">Could not find owner with ID {params.id}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{owner.name}</h1>
          <p className="text-muted-foreground">Owner Details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Ownership Type</h3>
            <p>{owner.ownership_type === "company" ? "Company Owned" : "Third Party"}</p>
          </div>
          
          {owner.email && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p>{owner.email}</p>
            </div>
          )}

          {owner.phone && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <p>{owner.phone}</p>
            </div>
          )}

          {owner.address && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p>{owner.address}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <DeleteOwnerButton id={owner.id} />
            <Button variant="outline" asChild>
              <Link href={`/owners/${owner.id}/edit`}>Edit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
