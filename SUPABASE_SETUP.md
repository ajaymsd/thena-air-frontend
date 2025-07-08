# Supabase Setup Guide

## Environment Variables Configuration

To fix the Supabase loading issue, you need to create a `.env.local` file in the frontend directory with your Supabase credentials.

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Create Environment File

Create a file named `.env.local` in the `frontend/` directory with the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with your actual Supabase credentials.

### Step 3: Restart Development Server

After creating the `.env.local` file, restart your development server:

```bash
cd frontend
npm run dev
```

## Database Setup

Make sure you have the following tables in your Supabase database:

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Troubleshooting

### If you still see loading issues:

1. **Check browser console** for any error messages
2. **Verify environment variables** are correctly set
3. **Check Supabase project status** - ensure it's not paused
4. **Clear browser cache** and reload the page
5. **Check network connectivity** to Supabase

### Common Issues:

- **"Invalid API key"**: Double-check your anon key
- **"Project not found"**: Verify your project URL
- **"CORS error"**: Ensure your Supabase project allows requests from your domain
- **"RLS policy error"**: Check that your database policies are correctly configured

## Security Notes

- Never commit your `.env.local` file to version control
- The anon key is safe to use in the frontend - it has limited permissions
- Use the service role key only in your backend services 