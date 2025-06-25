import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OwnerForm } from "@/components/forms/owner-form"
import { createOwner } from "@/app/actions/owners"

export default function NewOwnerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Owner</h1>
        <p className="text-muted-foreground">Create a new loft owner</p>
      </div>

      <OwnerForm 
        action={async (formData: FormData) => {
          "use server"
          const result = await createOwner(formData)
          if (result?.success) {
            redirect("/owners")
          }
          return result
        }}
      />
    </div>
  )
}
