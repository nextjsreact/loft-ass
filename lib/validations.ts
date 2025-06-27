import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
});

export const loftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  price_per_month: z.number().min(0, "Price must be a positive number"),
  status: z.enum(['available', 'occupied', 'maintenance']),
  owner_id: z.string().min(1, "Owner is required"),
  company_percentage: z.number().min(0).max(100),
  owner_percentage: z.number().min(0).max(100),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  due_date: z.coerce.date().optional(),
  assigned_to: z.string().optional(),
  team_id: z.string().optional(),
  loft_id: z.string().optional()
});

export const transactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be positive"),
  transaction_type: z.enum(['income', 'expense']),
  status: z.enum(['pending', 'completed', 'failed']),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string().optional(),
  loft_id: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;

export const loftOwnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  ownership_type: z.enum(['company', 'third_party'])
});

export type LoftOwnerFormData = z.infer<typeof loftOwnerSchema>;
