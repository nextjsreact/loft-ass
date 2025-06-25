-- Insert sample users
INSERT INTO users (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@loftmanager.com', 'System Admin', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'manager@loftmanager.com', 'Property Manager', 'manager'),
  ('550e8400-e29b-41d4-a716-446655440003', 'member@loftmanager.com', 'Team Member', 'member');

-- Insert sample loft owners
INSERT INTO loft_owners (id, name, email, phone, ownership_type) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'LoftManager Company', 'company@loftmanager.com', '+1-555-0100', 'company'),
  ('660e8400-e29b-41d4-a716-446655440002', 'John Smith Properties', 'john@smithproperties.com', '+1-555-0101', 'third_party'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Sarah Johnson Investments', 'sarah@johnsoninvest.com', '+1-555-0102', 'third_party');

-- Insert sample teams
INSERT INTO teams (id, name, description, created_by) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Maintenance Team', 'Handles property maintenance and repairs', '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Leasing Team', 'Manages tenant relations and leasing', '550e8400-e29b-41d4-a716-446655440002');

-- Insert team members
INSERT INTO team_members (team_id, user_id, role) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'manager'),
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'manager');

-- Insert sample lofts
INSERT INTO lofts (id, name, description, address, price_per_month, status, owner_id, company_percentage, owner_percentage) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'Downtown Loft A1', 'Modern loft in downtown area', '123 Main St, Downtown', 2500.00, 'occupied', '660e8400-e29b-41d4-a716-446655440001', 100.00, 0.00),
  ('880e8400-e29b-41d4-a716-446655440002', 'Riverside Loft B2', 'Luxury loft with river view', '456 River Ave, Riverside', 3200.00, 'available', '660e8400-e29b-41d4-a716-446655440002', 30.00, 70.00),
  ('880e8400-e29b-41d4-a716-446655440003', 'Industrial Loft C3', 'Converted warehouse loft', '789 Industrial Blvd', 2800.00, 'occupied', '660e8400-e29b-41d4-a716-446655440003', 40.00, 60.00);

-- Insert sample tasks
INSERT INTO tasks (id, title, description, status, due_date, assigned_to, team_id, loft_id, created_by) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', 'Fix heating system', 'Repair heating in Downtown Loft A1', 'in_progress', '2024-01-15 10:00:00+00', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  ('990e8400-e29b-41d4-a716-446655440002', 'Schedule property viewing', 'Arrange viewing for Riverside Loft B2', 'todo', '2024-01-20 14:00:00+00', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample transactions
INSERT INTO transactions (id, amount, description, transaction_type, status, loft_id, user_id) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', 2500.00, 'Monthly rent - Downtown Loft A1', 'income', 'completed', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
  ('aa0e8400-e29b-41d4-a716-446655440002', -150.00, 'Heating repair costs', 'expense', 'completed', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
  ('aa0e8400-e29b-41d4-a716-446655440003', 3200.00, 'Monthly rent - Riverside Loft B2', 'income', 'pending', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002');
