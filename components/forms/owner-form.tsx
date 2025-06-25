"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loftOwnerSchema, type LoftOwnerFormData } from "@/lib/validations"
import type { LoftOwner } from "@/lib/database"

interface OwnerFormProps {
  owner?: LoftOwner
  action: (formData: FormData) => Promise<{ error?: string }>
}

export function OwnerForm({ owner, action }: OwnerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoftOwnerFormData>({
    resolver: zodResolver(loftOwnerSchema),
    defaultValues: owner
      ? {
          name: owner.name,
          email: owner.email || "",
          phone: owner.phone || "",
          address: owner.address || "",
          ownership_type: owner.ownership_type,
        }
      : {
          ownership_type: "third_party",
        },
  })

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
        router.push("/owners")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{owner ? "Edit Owner" : "Add New Owner"}</CardTitle>
        <CardDescription>{owner ? "Update owner information" : "Create a new loft owner"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleFormSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownership_type">Ownership Type</Label>
              <Select onValueChange={(value) => setValue("ownership_type", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company Owned</SelectItem>
                  <SelectItem value="third_party">Third Party</SelectItem>
                </SelectContent>
              </Select>
              {errors.ownership_type && <p className="text-sm text-red-500">{errors.ownership_type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : owner ? "Update Owner" : "Create Owner"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
