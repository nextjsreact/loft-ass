import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default async function OwnersPage() {
  const session = await requireRole(["admin"])
  await ensureSchema()

  const owners = await sql`
    SELECT lo.*, 
           COUNT(l.id) as loft_count,
           COALESCE(SUM(l.price_per_month), 0) as total_monthly_value
    FROM loft_owners lo
    LEFT JOIN lofts l ON lo.id = l.owner_id
    GROUP BY lo.id, lo.name, lo.email, lo.phone, lo.address, lo.ownership_type, lo.created_at, lo.updated_at
    ORDER BY lo.created_at DESC
  `

  const getOwnershipColor = (type: string) => {
    return type === "company" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loft Owners</h1>
          <p className="text-muted-foreground">Manage property owners and partnerships</p>
        </div>
        <Button asChild>
          <Link href="/owners/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Owner
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {owners.map((owner: {
          id: string
          name: string
          email?: string
          phone?: string
          address?: string
          ownership_type: string
          loft_count: string
          total_monthly_value: string
        }) => (
          <Card key={owner.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{owner.name}</CardTitle>
                  <CardDescription>
                    {Number.parseInt(owner.loft_count)} properties • $
                    {Number.parseFloat(owner.total_monthly_value).toLocaleString()}/month
                  </CardDescription>
                </div>
                <Badge className={getOwnershipColor(owner.ownership_type)}>
                  {owner.ownership_type === "company" ? "Company" : "Third Party"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {owner.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{owner.email}</span>
                  </div>
                )}
                {owner.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{owner.phone}</span>
                  </div>
                )}
                {owner.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-2">{owner.address}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/owners/${owner.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/owners/${owner.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
