# Motion Web App

Next.js 14 web application for Motion.

## Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth
- Stripe (payments)

## Setup

```bash
npm install
cp .env.example .env.local  # Add your config
npm run dev
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)

## Run

```bash
npm run dev  # localhost:3000
```

See `.claude/project.md` for full development guide.
