# StudySpot (Next.js 14 + TypeScript)

High-tech study spot finder with social features, built with App Router.

## Stack
- Next.js 14 + TypeScript (strict)
- Tailwind CSS (glassmorphism + gradients)
- NextAuth credentials authentication
- Prisma ORM (PostgreSQL; works with Supabase Postgres)
- Pusher for realtime messaging events
- SWR hooks and modular API routes

## Setup
1. Install dependencies: `npm install`
2. Configure `.env.local` with:
   - `DATABASE_URL` (Supabase Postgres URL)
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   - `PUSHER_*` keys
3. Generate Prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate`
5. Start app: `npm run dev`

## Routing
- Public: `/`, `/login`, `/signup`
- Protected: `/dashboard`, `/groups`, `/messages`, `/profile/*`, `/spots/*`

## Notes on Supabase
This project uses Prisma + NextAuth on top of Postgres. If your backend is Supabase:
- Keep auth in NextAuth credentials for app session handling.
- Use Supabase primarily for managed Postgres + optional object storage.
- Replace `app/api/upload/route.ts` placeholder with Supabase Storage upload.
