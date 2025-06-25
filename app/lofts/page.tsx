import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function LoftsPage() {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  try {
    const lofts = await sql`
      SELECT l.*, lo.name as owner_name, lo.ownership_type
      FROM lofts l
      LEFT JOIN loft_owners lo ON l.owner_id = lo.id
      ORDER BY l.created_at DESC
    `

    const getStatusColor = (status: string) => {
      switch (status) {
        case "available":
          return "bg-green-100 text-green-800"
        case "occupied":
          return "bg-blue-100 text-blue-800"
        case "maintenance":
          return "bg-yellow-100 text-yellow-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lofts</h1>
            <p className="text-muted-foreground">Manage your loft properties</p>
          </div>
          {session.user.role === "admin" && (
            <Button asChild>
              <Link href="/lofts/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Loft
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lofts.map((loft) => (
            <Card key={loft.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{loft.name}</CardTitle>
                    <CardDescription>{loft.address}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(loft.status)}>{loft.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Rent:</span>
                    <span className="font-medium">${loft.price_per_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Owner:</span>
                    <span className="font-medium">{loft.owner_name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Company Share:</span>
                    <span className="font-medium">{loft.company_percentage}%</span>
                  </div>
                  {loft.description && <p className="text-sm text-muted-foreground mt-2">{loft.description}</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/lofts/${loft.id}`}>View</Link>
                  </Button>
                  {session.user.role === "admin" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lofts/${loft.id}/edit`}>Edit</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lofts</h1>
          <p className="text-muted-foreground">Loading loft data...</p>
        </div>
      </div>
    )
  }
}
