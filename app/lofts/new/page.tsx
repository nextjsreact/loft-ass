import { getOwners } from "@/app/actions/owners"
import { NewLoftFormWrapper } from "./new-loft-form"

export default async function NewLoftPage() {
  const owners = await getOwners()
  
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create New Loft</h1>
        <p className="text-muted-foreground mt-2">Add a new property listing</p>
      </div>
      <NewLoftFormWrapper owners={owners} />
    </div>
  )
}
