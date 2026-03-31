# Spotly

Spotly is a campus study spot discovery app built with Next.js, Prisma, NextAuth, and PostgreSQL. It includes:

- email/password auth
- study spot discovery and ratings
- saved lists
- friends and messaging
- study groups
- a live leaderboard

This README is for someone opening the repo for the first time and trying to run it locally.

## Tech Stack

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth
- Supabase Postgres
- Pusher for optional realtime events

## Prerequisites

Before you start, make sure you have:

- Node.js 20+ installed
- npm installed
- a PostgreSQL database
- a Supabase project if you want to match the current setup

## 1. Clone and install

```bash
git clone https://github.com/aadihuria/spotly.git
cd spotly
npm install
```

## 2. Create your environment file

Create a `.env.local` file in the project root.

Use this template:

```env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:5432/postgres?sslmode=require"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_publishable_key"

# Optional: email verification in production
RESEND_API_KEY=""
EMAIL_FROM=""

# Optional: phone verification in production
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Optional: realtime messaging
PUSHER_APP_ID=""
NEXT_PUBLIC_PUSHER_KEY=""
PUSHER_SECRET=""
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

### Notes

- `DATABASE_URL` is the main database connection.
- `DIRECT_URL` is used by Prisma for migrations.
- If you are using Supabase, the common local pattern is:
  - `DATABASE_URL` = pooled connection
  - `DIRECT_URL` = direct connection
- If your network cannot reach Supabase’s direct host, you may need to use the pooled connection for both in local development.
- `NEXTAUTH_SECRET` should be a long random string.

You can generate one with:

```bash
openssl rand -base64 32
```

## 3. Generate Prisma client

```bash
npm run prisma:generate
```

## 4. Run database migrations

```bash
npm run prisma:migrate
```

This applies the migrations in:

- [20260330220902_init](./prisma/migrations/20260330220902_init/migration.sql)
- [20260331024500_lists_profiles_reviews](./prisma/migrations/20260331024500_lists_profiles_reviews/migration.sql)
- [20260331032549_friendships_dm_requests](./prisma/migrations/20260331032549_friendships_dm_requests/migration.sql)
- [20260331041742_auth_verification_codes](./prisma/migrations/20260331041742_auth_verification_codes/migration.sql)

## 5. Start the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Local auth behavior

The app supports email verification and optional phone-code login.

In local development:

- if `RESEND_API_KEY` is not set, email codes fall back to a dev preview flow
- if Twilio credentials are not set, SMS codes fall back to a dev preview flow

So you can still test signup and login locally without wiring production providers first.

## Important routes

Public routes:

- `/`
- `/login`
- `/signup`

Main app routes:

- `/dashboard`
- `/search`
- `/lists`
- `/groups`
- `/messages`
- `/leaderboard`
- `/profile`

## Common issues

### `P1001: Can't reach database server`

Your database connection is wrong or unreachable from your machine.

Check:

- host
- username
- password
- whether your Supabase connection type is correct

### `P1000: Authentication failed`

Your database password is incorrect in `DATABASE_URL` or `DIRECT_URL`.

### `Could not sign in`

Usually one of these:

- the user has not verified their email yet
- the password is wrong
- the dev server needs a restart after env or Prisma changes

Try:

```bash
npm run prisma:generate
npm run dev
```

### `localhost` loads the wrong version

If you switched branches, restart the dev server:

```bash
pkill -f "next-server"
npm run dev
```

## Production notes

For a real deployment, you should eventually configure:

- a real email provider through `RESEND_API_KEY`
- a real SMS provider through Twilio
- Pusher if you want live messaging updates without refresh

If you deploy to Vercel or another host, add the same env vars there.

## Project structure

Key folders:

- `app/` — Next.js routes and API handlers
- `components/` — UI components
- `lib/` — auth, Prisma, verification, Supabase, and shared utilities
- `prisma/` — schema and migrations

## Git workflow

If you are working on a feature branch and want to bring it into `main`, a safe local flow is:

```bash
git checkout main
git pull origin main
git merge --squash your-feature-branch
git commit -m "Add Spotly feature updates"
git push origin main
```

## License

This project currently does not include a license file. Add one before distributing publicly if needed.
