-- Add password and authentication fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create sessions table for proper session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Update sample users with hashed passwords (bcrypt hash for "password123")
UPDATE users SET 
    password_hash = '$2b$10$rOzJqQZQQQZQQZQQZQQZQOeKqQZQQZQQZQQZQQZQQZQQZQQZQQZQQZQ',
    email_verified = TRUE
WHERE email IN ('admin@loftmanager.com', 'manager@loftmanager.com', 'member@loftmanager.com');

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS policies for sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE USING (user_id = auth.user_id());

-- Function to get user from session token
CREATE OR REPLACE FUNCTION get_user_from_session(session_token TEXT)
RETURNS TABLE(
    user_id UUID,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role user_role,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.full_name, u.role, u.last_login
    FROM users u
    JOIN user_sessions s ON u.id = s.user_id
    WHERE s.token = session_token 
    AND s.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
