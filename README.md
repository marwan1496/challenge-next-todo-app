# Pomofocus Todo App

A beautiful and productive todo app inspired by the Pomodoro Technique, built with Next.js, Supabase, and Tailwind CSS.

## Features

- ✨ **Add Tasks**: Create tasks with titles, descriptions, and estimated pomodoros
- ✏️ **Edit Tasks**: Modify task details inline
- ✅ **Mark Complete**: Toggle task completion status
- 🍅 **Pomodoro Integration**: Estimate and track pomodoros for each task
- 💾 **Data Persistence**: All data stored in Supabase (no local storage)
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- 👤 **User Management**: Simple user setup with email and name

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the project settings
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
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

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (user_email = auth.email());

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (user_email = auth.email());
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel
4. Deploy!

### Environment Variables for Production

Make sure to add these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/             # React components
│   ├── Header.tsx         # App header with user info
│   ├── TaskForm.tsx       # Add new task form
│   ├── TaskItem.tsx       # Individual task component
│   ├── TaskList.tsx       # List of all tasks
│   └── UserSetup.tsx      # User setup component
├── lib/                    # Utility functions
│   └── supabase.ts        # Supabase client
└── env.example            # Environment variables template
```

## Features Explained

### Pomodoro Integration
Each task can have an estimated number of pomodoros (25-minute work sessions). This helps users plan their work and track progress.

### Data Persistence
All data is stored in Supabase, ensuring your tasks persist across devices and browser sessions.

### User Management
Simple user setup with email and name. No complex authentication - just basic user identification for data organization.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.
