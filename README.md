# CoFound Central Asia

A co-founder matching platform purpose-built for the Central Asian startup ecosystem. Inspired by YC's co-founder matching, designed for founders in Kazakhstan, Kyrgyzstan, Uzbekistan, Tajikistan, and Turkmenistan.

**Tech Stack:** Next.js 14 · Supabase · Tailwind CSS · shadcn/ui · next-intl (EN/RU/UZ)

---

## Table of Contents

1. [What This Platform Does](#what-this-platform-does)
2. [Prerequisites](#prerequisites)
3. [Local Setup](#local-setup)
4. [Supabase Setup](#supabase-setup)
5. [Running Database Migrations](#running-database-migrations)
6. [Running Seed Data](#running-seed-data)
7. [Telegram Bot Setup](#telegram-bot-setup)
8. [Running the App Locally](#running-the-app-locally)
9. [Making Yourself an Admin](#making-yourself-an-admin)
10. [Deploying to Vercel](#deploying-to-vercel)
11. [Project Structure](#project-structure)
12. [Features](#features)
13. [Troubleshooting](#troubleshooting)

---

## What This Platform Does

CoFound Central Asia helps founders in Central Asia find their ideal co-founder. The platform includes:

- **Founder Discovery** — Browse and filter founders by country, skills, industry, role, and more
- **Smart Matching** — An algorithm scores compatibility based on complementary roles, shared industries, commitment level, location, and languages
- **Startup Ideas Board** — Post ideas, get upvotes, and find interested collaborators
- **Real-time Messaging** — Chat with your connections directly on the platform
- **Accelerator Directory** — Browse accelerators like Astana Hub, IT Park, MOST, and UTECH
- **Telegram Integration** — Login with Telegram and receive bot notifications
- **Multilingual** — Full support for English, Russian, and Uzbek

---

## Prerequisites

Before you start, you need to install two things on your computer:

### 1. Install Node.js

Node.js is what runs the application on your computer.

1. Go to [https://nodejs.org](https://nodejs.org)
2. Click the button that says **"LTS"** (Long Term Support) — this is the stable version
3. Download the installer for your operating system (Windows/Mac/Linux)
4. Run the installer — click "Next" through all the steps, accepting the defaults
5. After installation, open your **Terminal** (Mac/Linux) or **Command Prompt** (Windows)
6. Type this command and press Enter to verify it installed correctly:
   ```
   node --version
   ```
   You should see a version number like `v20.x.x` or `v22.x.x`

### 2. Install Git

Git is used to manage code. You may already have it installed.

1. Open Terminal / Command Prompt
2. Type `git --version` and press Enter
3. If you see a version number, you already have it
4. If not, go to [https://git-scm.com/downloads](https://git-scm.com/downloads) and install it

---

## Local Setup

### Step 1: Get the Code

Open your Terminal and run these commands one at a time:

```bash
# Navigate to where you want the project (e.g., your home folder or Desktop)
cd ~/Desktop

# Clone the repository (replace with your actual repo URL)
git clone <your-repo-url> ca-cofounder-platform

# Go into the project folder
cd ca-cofounder-platform
```

If you're not using Git, you can also download the code as a ZIP file from GitHub, unzip it, and open Terminal in that folder.

### Step 2: Install Dependencies

This downloads all the libraries the project needs:

```bash
npm install
```

This will take 1-2 minutes. You'll see a progress bar. Wait until it finishes.

### Step 3: Create Your Environment File

The app needs certain secret keys to connect to Supabase and Telegram. These are stored in a file called `.env.local`.

```bash
# Create .env.local from the example file
cp .env.local.example .env.local
```

Now open `.env.local` in any text editor. You'll fill in the values in the next steps.

---

## Supabase Setup

Supabase is the database and authentication service that powers the app. It's free to start.

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (top right)
3. Sign up with your GitHub account (recommended) or email
4. You'll be taken to the Supabase Dashboard

### Step 2: Create a New Project

1. Click the **"New Project"** button
2. Fill in:
   - **Name:** `cofound-central-asia` (or any name you like)
   - **Database Password:** Choose a strong password and **write it down** — you'll need it later
   - **Region:** Select **EU Central (Frankfurt)** (`eu-central-1`) — this is closest to Central Asia
3. Click **"Create new project"**
4. Wait about 2 minutes for the project to finish setting up. You'll see a loading screen.

### Step 3: Get Your API Keys

1. In the left sidebar, click **"Project Settings"** (gear icon at the bottom)
2. Click **"API"** in the settings menu
3. You'll see two sections:

**Project URL:**
- Copy the URL (looks like `https://xxxxxxxxxxxx.supabase.co`)
- Paste it in your `.env.local` file next to `NEXT_PUBLIC_SUPABASE_URL=`

**Project API Keys:**
- Copy the `anon` `public` key (the longer one marked as safe for browsers)
- Paste it next to `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- Copy the `service_role` key (click "Reveal" to see it)
- Paste it next to `SUPABASE_SERVICE_ROLE_KEY=`

> **Important:** The `service_role` key is a secret. Never share it or commit it to Git.

Your `.env.local` should now look something like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

### Step 4: Enable Email Authentication

1. In the Supabase dashboard, go to **Authentication** (left sidebar)
2. Click **"Providers"**
3. Make sure **Email** is enabled (it should be by default)
4. Under Email settings, you can optionally disable "Confirm email" for easier testing

---

## Running Database Migrations

The database needs tables to store data. We have SQL migration files that create everything.

### Step 1: Open the SQL Editor

1. In the Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"** (top left)

### Step 2: Run Each Migration File

You need to run the migration files **in order**. For each file:

1. Open the file from the `supabase/migrations/` folder in your text editor
2. Copy ALL the SQL code
3. Paste it into the SQL Editor in Supabase
4. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
5. You should see "Success" at the bottom

Run them in this exact order:

| # | File | What it creates |
|---|------|----------------|
| 1 | `001_profiles.sql` | User profiles table + auto-create trigger |
| 2 | `002_ideas.sql` | Startup ideas table |
| 3 | `003_idea_upvotes.sql` | Upvotes for ideas + auto-count trigger |
| 4 | `004_matches.sql` | Co-founder matches table |
| 5 | `005_connections.sql` | Connection requests table |
| 6 | `006_threads_messages.sql` | Chat threads and messages |
| 7 | `007_idea_interests.sql` | Interest expressions on ideas |
| 8 | `008_accelerators.sql` | Accelerator programs + members |
| 9 | `009_notifications.sql` | Notifications table |
| 10 | `010_functions_triggers.sql` | Profile completeness calculator + thread helper |
| 11 | `011_rls_policies.sql` | Security policies for all tables + storage bucket |

> **Important:** If you get an error on any file, make sure you ran all previous files first. The order matters because later tables reference earlier ones.

### Step 3: Verify

After running all migrations, click **"Table Editor"** in the left sidebar. You should see these tables:
- profiles
- ideas
- idea_upvotes
- matches
- connections
- threads
- messages
- idea_interests
- accelerators
- accelerator_members
- notifications

---

## Running Seed Data

Seed data fills the database with sample founders, ideas, and accelerators so you can see how the app looks.

### Option A: Just Accelerators (Recommended to Start)

The easiest approach is to seed just the accelerators (they don't require user accounts):

1. Open `supabase/seed.sql` in a text editor
2. Find the section that starts with `-- ACCELERATORS`
3. Copy just the 4 `INSERT INTO public.accelerators` statements
4. Paste into the Supabase SQL Editor and click Run

### Option B: Full Seed Data

To seed all 20 profiles and 5 ideas, you need to first create test user accounts. See `supabase/seed-instructions.md` for detailed step-by-step instructions.

---

## Telegram Bot Setup

Telegram integration is optional but recommended. It enables:
- Logging in with Telegram
- Receiving notifications via a Telegram bot

### Step 1: Create a Bot

1. Open Telegram on your phone or computer
2. Search for **@BotFather** (it has a blue verified checkmark)
3. Start a chat with BotFather
4. Send the message: `/newbot`
5. BotFather will ask for a **name** — type: `CoFound Central Asia`
6. BotFather will ask for a **username** — type something like: `cofound_ca_bot` (must end in `bot`)
7. BotFather will reply with a message containing your **bot token** — it looks like: `7123456789:AAF1234567890abcdefghijklmnop`
8. Copy this token

### Step 2: Configure the Bot for Login

1. Still in the BotFather chat, send: `/setdomain`
2. Select your bot
3. Enter your domain: `localhost` (for development) or your production domain later

### Step 3: Add to Environment

In your `.env.local` file:

```
TELEGRAM_BOT_TOKEN=7123456789:AAF1234567890abcdefghijklmnop
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=cofound_ca_bot
```

> **Note:** The `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` should be without the `@` symbol.

---

## Running the App Locally

Now you're ready to run the app!

```bash
npm run dev
```

Open your browser and go to: [http://localhost:3000](http://localhost:3000)

You should see the login page. Create an account using your email and password, then go through the onboarding wizard.

### Stopping the App

Press `Ctrl + C` in the terminal to stop the development server.

---

## Making Yourself an Admin

The admin dashboard lets you manage users, ideas, and accelerators. To access it:

1. First, register an account on the platform and note your email
2. Go to the Supabase dashboard
3. Click **"SQL Editor"**
4. Run this SQL command (replace the email with yours):

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
```

5. Refresh the app — you should now see "Admin" in the sidebar menu

---

## Deploying to Vercel

Vercel is the easiest way to put your app online for free.

### Step 1: Push to GitHub

1. Create a new repository on [https://github.com/new](https://github.com/new)
2. Name it `ca-cofounder-platform`
3. Keep it public or private (your choice)
4. Don't check any of the initialization options
5. Click "Create repository"
6. In your terminal, run:

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ca-cofounder-platform.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click **"Add New..."** then **"Project"**
4. Find and select your `ca-cofounder-platform` repository
5. Vercel will detect it's a Next.js project automatically
6. Before clicking Deploy, click **"Environment Variables"**
7. Add each of these variables (copy from your `.env.local`):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g., `https://your-app.vercel.app`) |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Your Telegram bot username |

8. Click **"Deploy"**
9. Wait 2-3 minutes for the build to complete
10. Your app will be live at `https://your-project-name.vercel.app`

### Step 3: Update Supabase URLs

After deploying, go back to Supabase:

1. Go to **Authentication** then **URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g., `https://your-app.vercel.app`)
3. Add your Vercel URL to **Redirect URLs**

Also update the Telegram bot domain:
1. Go to @BotFather on Telegram
2. Send `/setdomain`
3. Enter your Vercel domain (without `https://`)

---

## Project Structure

```
ca-cofounder-platform/
├── app/
│   ├── [locale]/                    # All routes wrapped in locale (en/ru/uz)
│   │   ├── (auth)/                  # Auth routes (no sidebar)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── onboarding/          # 5-step wizard
│   │   ├── (main)/                  # App routes (with sidebar)
│   │   │   ├── discover/            # Browse founders
│   │   │   ├── matches/             # AI-powered matches
│   │   │   ├── ideas/               # Startup ideas board
│   │   │   ├── messages/            # Real-time chat
│   │   │   ├── profile/             # View & edit profiles
│   │   │   ├── accelerators/        # Accelerator directory
│   │   │   ├── notifications/       # Notification center
│   │   │   └── settings/            # Account settings
│   │   └── (admin)/                 # Admin dashboard
│   │       └── admin/
│   └── api/                         # API routes
│       ├── auth/telegram/           # Telegram auth
│       ├── matches/                 # Matching algorithm
│       ├── notifications/telegram/  # Telegram notifications
│       └── upload/                  # File uploads
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── layout/                      # Navbar, Sidebar, MobileNav
│   ├── profile/                     # Profile cards, forms
│   ├── discover/                    # Founder grid, filters
│   ├── matches/                     # Match cards, scores
│   ├── ideas/                       # Idea cards, forms
│   ├── messaging/                   # Chat components
│   ├── accelerators/                # Accelerator cards
│   ├── notifications/               # Notification items
│   └── shared/                      # Shared components
├── lib/                             # Utilities
│   ├── supabase.ts                  # Browser Supabase client
│   ├── supabase-server.ts           # Server Supabase client
│   ├── supabase-admin.ts            # Admin Supabase client
│   ├── matching.ts                  # Matching algorithm
│   ├── telegram.ts                  # Telegram helpers
│   └── utils.ts                     # Utility functions
├── messages/                        # Translation files
│   ├── en.json                      # English
│   ├── ru.json                      # Russian
│   └── uz.json                      # Uzbek
├── supabase/
│   ├── migrations/                  # SQL migration files (001-011)
│   ├── seed.sql                     # Sample data
│   └── seed-instructions.md         # Seeding guide
├── types/
│   └── database.ts                  # TypeScript types
├── middleware.ts                     # Auth + i18n middleware
├── next.config.js                   # Next.js config
└── vercel.json                      # Vercel config
```

---

## Features

### Matching Algorithm

The matching algorithm scores compatibility on a 100-point scale across 6 dimensions:

| Category | Max Points | How it Works |
|----------|-----------|--------------|
| Roles | 30 | Technical + Business = 30, Technical + Design = 20, Same = 5 |
| Industry | 20 | Percentage of shared industries |
| Commitment | 20 | Same level = 20, Mixed = 10, Mismatch = 0 |
| Stage | 10 | Same stage = 10, Adjacent = 5 |
| Location | 10 | Same city = 10, Same country = 7, Neighbor = 4 |
| Languages | 10 | 2+ shared = 10, 1 shared = 5 |

### Internationalization

The platform supports three languages:
- **English** (EN) — Default
- **Russian** (RU) — Русский
- **Uzbek** (UZ) — O'zbek

Switch languages using the toggle in the top navigation bar. Your preference is saved across sessions.

### Real-time Messaging

Messages are delivered in real-time using Supabase Realtime. No page refresh needed.

### Dark Mode

Toggle between Light, Dark, and System themes in Settings.

---

## Troubleshooting

### "Module not found" errors when running `npm run dev`

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Invalid API key" error

Make sure your `.env.local` file has the correct Supabase keys. The keys should not have quotes around them:

```
# Correct:
NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co

# Wrong:
NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"
```

### Migrations fail with "relation does not exist"

Make sure you run the migration files **in numerical order** (001 first, then 002, etc.). Each file depends on the previous ones.

### "RLS policy violation" errors

This usually means Row Level Security is blocking a query. Make sure migration `011_rls_policies.sql` was run successfully.

### Login doesn't work

1. Check that email auth is enabled in Supabase Dashboard > Authentication > Providers
2. If you enabled email confirmation, check your inbox (and spam folder)
3. For development, you can disable email confirmation in Supabase > Authentication > Email Templates

### Images don't load

Make sure the `avatars` storage bucket was created. Run migration `011_rls_policies.sql` which creates it.

### The app shows in English only

Make sure the `/messages/` folder contains all three files: `en.json`, `ru.json`, and `uz.json`.

### Telegram login doesn't work

1. Make sure `TELEGRAM_BOT_TOKEN` and `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` are set in `.env.local`
2. The bot domain must be set via @BotFather with `/setdomain`
3. For localhost development, set the domain to `localhost`

### How to reset the database

If you need to start fresh:

1. Go to Supabase Dashboard > SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run all migration files in order
4. Re-run the seed data

### Build fails on Vercel

1. Make sure all environment variables are set in Vercel's project settings
2. Check the build logs for specific error messages
3. Try running `npm run build` locally first to catch errors

---

## License

MIT

---

Built for the Central Asian startup ecosystem.
