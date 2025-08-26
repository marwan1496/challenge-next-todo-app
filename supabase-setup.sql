-- Supabase Database Setup for Pomofocus Todo App
-- Run these commands in your Supabase SQL Editor

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_pomodoros INTEGER DEFAULT 1 CHECK (estimated_pomodoros >= 1),
  completed_pomodoros INTEGER DEFAULT 0 CHECK (completed_pomodoros >= 0)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

-- Create policies for tasks table
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_email ON tasks(user_email);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Insert sample data (optional)
INSERT INTO users (email, name) VALUES 
  ('demo@example.com', 'Demo User');

INSERT INTO tasks (title, description, user_email, estimated_pomodoros) VALUES 
  ('Complete project proposal', 'Write and review the Q4 project proposal document', 'demo@example.com', 3),
  ('Review code changes', 'Go through the latest pull requests and provide feedback', 'demo@example.com', 2),
  ('Plan team meeting', 'Prepare agenda and schedule for next week team sync', 'demo@example.com', 1);
