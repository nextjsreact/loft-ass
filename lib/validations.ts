import { z } from "zod"

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "manager", "member"]).default("member"),
})

// Owner Schema
export const loftOwnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  ownership_type: z.enum(["company", "third_party"])
})

// Loft Schema
export const loftSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    price_per_month: z.number().min(0, "Price must be positive"),
    status: z.enum(["available", "occupied", "maintenance"]),
    owner_id: z.string().uuid("Invalid owner ID"),
    company_percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
    owner_percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  })
  .refine((data) => data.company_percentage + data.owner_percentage === 100, {
    message: "Company and owner percentages must sum to 100%",
    path: ["owner_percentage"],
  })

// Transaction Schema
export const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  transaction_type: z.enum(["income", "expense"]),
  status: z.enum(["pending", "completed", "failed"]).optional(),
  loft_id: z.string().optional(),
  user_id: z.string().optional()
})

export type TransactionFormData = z.infer<typeof transactionSchema>

// Task Schema
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed"]),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  team_id: z.string().optional(),
  loft_id: z.string().optional()
})

export type TaskFormData = z.infer<typeof taskSchema>
