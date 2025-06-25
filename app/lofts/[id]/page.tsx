import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoftDetailPage({ params }: { params: { id: string } }) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const [loft] = await sql`
    SELECT l.*, lo.name as owner_name, lo.ownership_type
    FROM lofts l
    LEFT JOIN loft_owners lo ON l.owner_id = lo.id
    WHERE l.id = ${params.id}
  `

  if (!loft) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{loft.name}</h1>
        <p className="text-muted-foreground">{loft.address}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loft Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{loft.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="font-medium">${loft.price_per_month}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{loft.owner_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ownership Type</p>
              <p className="font-medium capitalize">{loft.ownership_type?.replace('_', ' ')}</p>
            </div>
          </div>
          {loft.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{loft.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
