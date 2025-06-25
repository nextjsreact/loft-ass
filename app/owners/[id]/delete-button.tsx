"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { deleteOwner } from "@/app/actions/owners"
import { useToast } from "@/components/ui/use-toast"

export function DeleteOwnerButton({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this owner?")) {
      try {
        await deleteOwner(id)
        toast({
          title: "Owner deleted",
          description: "The owner has been successfully removed",
        })
        router.push("/owners")
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete owner",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
    >
      Delete Owner
    </Button>
  )
}
