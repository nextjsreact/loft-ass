export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: Date | string; // Allow due_date to be a string or Date object
  assigned_to?: string;
  team_id?: string;
  loft_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoftOwner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  ownership_type: string;
}

export interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  date: Date;
  category?: string;
  created_at: Date;
  updated_at: Date;
}
