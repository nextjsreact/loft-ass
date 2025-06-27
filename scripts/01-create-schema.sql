-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
