"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DeleteButton({ 
  id,
  onDelete
}: {
  id: string
  onDelete: (id: string) => Promise<void>
}) {
  const router = useRouter()

  const handleClick = async () => {
    if (confirm('Are you sure you want to delete this loft? This cannot be undone.')) {
      try {
        await onDelete(id)
        router.push("/lofts")
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }

  return (
    <Button 
      variant="destructive"
      onClick={handleClick}
    >
      Delete Loft
    </Button>
  )
}
