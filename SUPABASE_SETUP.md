# Supabase Integration Setup Guide - CityMindAI

This document outlines the database schema and security policies required to enable the persistent Supabase backend for the CityMindAI operations platform.

---

## 1. Database Table Schema SQL

Run the following DDL script inside the **Supabase SQL Editor** to create the complaints queue table:

```sql
-- Create complaints table
create table complaints (
  id bigint primary key,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  urgency text not null,
  status text not null,
  ai_summary text,
  tags text[],
  sentiment text,
  detected_issue text,
  recommended_action text,
  confidence text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table complaints enable row level security;
```

---

## 2. Row Level Security (RLS) Policies

To allow anonymous public access (appropriate for a prototype or hackathon environment), configure the following RLS policies:

```sql
-- Policy to allow anonymous reads
create policy "Allow public read access" on complaints
  for select using (true);

-- Policy to allow anonymous submissions
create policy "Allow public insert access" on complaints
  for insert with check (true);

-- Policy to allow anonymous triage and updates
create policy "Allow public update access" on complaints
  for update using (true);
```

---

## 3. Environment Variables Configuration

Copy the credentials from your Supabase dashboard (**Project Settings → API**) and append them to your local [`.env.local`](file:///c:/Users/ADMIN/Documents/CityMindAI/.env.local) file:

```env
# Supabase API Endpoint Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*Note: `.env.local` is ignored in Git and will not be pushed to GitHub to preserve security.*
