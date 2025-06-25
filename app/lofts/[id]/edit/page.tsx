import { LoftForm } from "@/components/forms/loft-form"
import { getLoft, updateLoft, deleteLoft } from "@/app/actions/lofts"
import { getOwners } from "@/app/actions/owners"
import { notFound, redirect } from "next/navigation"
import { DeleteButton } from "./delete-button"

export default async function EditLoftPage({ params }: { params: { id: string } }) {
  const [loft, owners] = await Promise.all([
    getLoft(params.id),
    getOwners()
  ])

  if (!loft) {
    return notFound()
  }

  async function handleUpdate(data: {
    address: string
    name: string
    status: "available" | "occupied" | "maintenance"
    price_per_month: number
    owner_id: string
    company_percentage: number
    owner_percentage: number
    description?: string
  }) {
    "use server"
    try {
      await updateLoft(params.id, data)
      redirect(`/lofts/${params.id}`)
    } catch (error) {
      console.error("Failed to update loft:", error)
      throw error
    }
  }

  async function handleDelete() {
    "use server"
    try {
      await deleteLoft(params.id)
      redirect("/lofts")
    } catch (error) {
      console.error("Failed to delete loft:", error)
      throw error
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Loft</h1>
        <DeleteButton 
          id={params.id}
          onDelete={deleteLoft}
        />
      </div>

      <LoftForm
        loft={loft}
        owners={owners}
        onSubmit={handleUpdate}
      />
    </div>
  )
}
