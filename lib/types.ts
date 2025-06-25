export interface LoftOwner {
  id: string
  name: string
  ownership_type: "company" | "third_party"
  created_at: string
  updated_at: string
}

export interface Loft {
  id: string
  name: string
  description?: string
  address: string
  price_per_month: number
  status: "available" | "occupied" | "maintenance"
  owner_id: string
  company_percentage: number
  owner_percentage: number
  created_at: string
  updated_at: string
}

export default {}
