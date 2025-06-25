"use client"

import { LoftForm } from "@/components/forms/loft-form"
import { createLoft } from "@/app/actions/lofts"
import type { LoftOwner } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export function NewLoftFormWrapper({ owners }: { owners: LoftOwner[] }) {
  const handleSubmit = async (data: any) => {
    try {
      const result = await createLoft(data)
      if (result?.success) {
        toast({
          title: "Success",
          description: `Loft created (ID: ${result.loftId})`,
          duration: 10000,
          action: (
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = `/lofts/${result.loftId}`}>
                View Loft
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Create Another
              </Button>
            </div>
          )
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create loft",
        variant: "destructive",
        duration: 10000
      })
    }
  }

  return <LoftForm owners={owners} onSubmit={handleSubmit} />
}
