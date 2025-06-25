-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loft_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE lofts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create auth helper function
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::UUID;
$$ LANGUAGE SQL STABLE;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Users RLS policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.user_id());

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (auth.user_role() = 'admin');

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.user_id());

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (auth.user_role() = 'admin');

-- Teams RLS policies
CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.user_id())
    OR auth.user_role() = 'admin'
  );

CREATE POLICY "Admins and managers can manage teams" ON teams
  FOR ALL USING (auth.user_role() IN ('admin', 'manager'));

-- Team members RLS policies
CREATE POLICY "Users can view team memberships" ON team_members
  FOR SELECT USING (
    user_id = auth.user_id() 
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.user_id())
    OR auth.user_role() = 'admin'
  );

CREATE POLICY "Admins and managers can manage team members" ON team_members
  FOR ALL USING (auth.user_role() IN ('admin', 'manager'));

-- Loft owners RLS policies
CREATE POLICY "Admins and managers can view loft owners" ON loft_owners
  FOR SELECT USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins can manage loft owners" ON loft_owners
  FOR ALL USING (auth.user_role() = 'admin');

-- Lofts RLS policies
CREATE POLICY "All authenticated users can view lofts" ON lofts
  FOR SELECT USING (auth.user_id() IS NOT NULL);

CREATE POLICY "Admins and managers can manage lofts" ON lofts
  FOR ALL USING (auth.user_role() IN ('admin', 'manager'));

-- Tasks RLS policies
CREATE POLICY "Users can view assigned tasks or team tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.user_id()
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.user_id())
    OR auth.user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Users can update their assigned tasks" ON tasks
  FOR UPDATE USING (assigned_to = auth.user_id());

CREATE POLICY "Admins and managers can manage all tasks" ON tasks
  FOR ALL USING (auth.user_role() IN ('admin', 'manager'));

-- Transactions RLS policies
CREATE POLICY "Users can view their transactions" ON transactions
  FOR SELECT USING (
    user_id = auth.user_id()
    OR auth.user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admins and managers can manage transactions" ON transactions
  FOR ALL USING (auth.user_role() IN ('admin', 'manager'));
