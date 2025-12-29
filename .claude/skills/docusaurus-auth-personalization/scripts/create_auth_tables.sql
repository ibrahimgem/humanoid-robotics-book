-- Better Auth + User Profiling Database Schema
-- Run this migration to create necessary tables

-- Users table (extended from Better Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (Better Auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- User background profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Programming background
  python_level TEXT CHECK (python_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  javascript_level TEXT CHECK (javascript_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  cpp_level TEXT CHECK (cpp_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Robotics background
  ros_level TEXT CHECK (ros_level IN ('none', 'beginner', 'intermediate', 'advanced', 'expert')),
  ros2_level TEXT CHECK (ros2_level IN ('none', 'beginner', 'intermediate', 'advanced', 'expert')),

  -- Hardware experience
  has_robot_experience BOOLEAN DEFAULT FALSE,
  robot_platforms TEXT[],  -- e.g., ['TurtleBot', 'Fetch', 'UR5']

  -- Simulation tools
  gazebo_experience BOOLEAN DEFAULT FALSE,
  isaac_sim_experience BOOLEAN DEFAULT FALSE,
  unity_robotics_experience BOOLEAN DEFAULT FALSE,

  -- AI/ML background
  ml_level TEXT CHECK (ml_level IN ('none', 'beginner', 'intermediate', 'advanced', 'expert')),
  has_llm_experience BOOLEAN DEFAULT FALSE,
  has_cv_experience BOOLEAN DEFAULT FALSE,

  -- Learning preferences
  preferred_learning_style TEXT CHECK (preferred_learning_style IN ('theory', 'hands-on', 'mixed')),
  interests TEXT[],  -- e.g., ['manipulation', 'navigation', 'computer_vision']

  -- Metadata
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content personalization (track which modules users should see)
CREATE TABLE IF NOT EXISTS user_content_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Adaptive content flags
  show_beginner_content BOOLEAN DEFAULT TRUE,
  show_intermediate_content BOOLEAN DEFAULT FALSE,
  show_advanced_content BOOLEAN DEFAULT FALSE,

  -- Module visibility
  recommended_modules TEXT[],
  completed_modules TEXT[],
  skipped_modules TEXT[],

  -- Personalization settings
  hide_prerequisites BOOLEAN DEFAULT FALSE,
  show_additional_resources BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  page_id TEXT NOT NULL,

  -- Progress metrics
  visited BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,

  -- Engagement
  bookmarked BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Timestamps
  first_visited_at TIMESTAMP,
  last_visited_at TIMESTAMP,
  completed_at TIMESTAMP,

  UNIQUE(user_id, module_id, page_id)
);

-- Verification tokens (for email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_content_preferences_updated_at BEFORE UPDATE ON user_content_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
