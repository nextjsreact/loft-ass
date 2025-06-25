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
import { loftSchema, type LoftFormData } from "@/lib/validations"
import type { Loft, LoftOwner } from "@/lib/database"

interface LoftFormProps {
  loft?: Loft
  owners: LoftOwner[]
  onSubmit: (data: LoftFormData) => Promise<void>
  isSubmitting?: boolean
}

export function LoftForm({ loft, owners, onSubmit, isSubmitting = false }: LoftFormProps) {
  console.log('LoftForm props:', { owners, loft }) // Debug props
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoftFormData>({
    resolver: zodResolver(loftSchema),
    defaultValues: loft
      ? {
          name: loft.name,
          description: loft.description || "",
          address: loft.address,
          price_per_month: loft.price_per_month,
          status: loft.status,
          owner_id: loft.owner_id,
          company_percentage: loft.company_percentage,
          owner_percentage: loft.owner_percentage,
        }
      : {
          status: "available",
          company_percentage: 50,
          owner_percentage: 50,
        },
  })

  const companyPercentage = watch("company_percentage")

  const handleFormSubmit = async (data: LoftFormData) => {
    setIsLoading(true)
    setError("")

    try {
      await onSubmit(data)
      // No automatic navigation - let parent component handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{loft ? "Edit Loft" : "Add New Loft"}</CardTitle>
        <CardDescription>{loft ? "Update loft information" : "Create a new loft property"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_per_month">Monthly Rent ($)</Label>
              <Input
                id="price_per_month"
                type="number"
                step="0.01"
                {...register("price_per_month", { valueAsNumber: true })}
              />
              {errors.price_per_month && <p className="text-sm text-red-500">{errors.price_per_month.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_id">Owner</Label>
              <Select onValueChange={(value) => setValue("owner_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name} ({owner.ownership_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.owner_id && <p className="text-sm text-red-500">{errors.owner_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_percentage">Company Share (%)</Label>
              <Input
                id="company_percentage"
                type="number"
                min="0"
                max="100"
                {...register("company_percentage", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    setValue("owner_percentage", 100 - value)
                  },
                })}
              />
              {errors.company_percentage && <p className="text-sm text-red-500">{errors.company_percentage.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_percentage">Owner Share (%)</Label>
              <Input
                id="owner_percentage"
                type="number"
                min="0"
                max="100"
                {...register("owner_percentage", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    setValue("company_percentage", 100 - value)
                  },
                })}
              />
              {errors.owner_percentage && <p className="text-sm text-red-500">{errors.owner_percentage.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {(isLoading || isSubmitting) ? "Saving..." : loft ? "Update Loft" : "Create Loft"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Reset Form
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/lofts')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
