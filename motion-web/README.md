# Motion Web App 🌐

Next.js 14 web application for Motion - AI-powered local adventure discovery.

## Overview

The Motion web app provides a premium web experience for discovering, creating, and managing local adventures. Built with Next.js 14 and modern web technologies for optimal performance and user experience.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context
- **Auth**: Supabase Auth
- **Database**: Supabase
- **Payments**: Stripe (subscription management)

## Project Structure

```
motion-web/
├── src/
│   ├── app/             # Next.js app router pages
│   │   ├── page.tsx     # Home/Discover page
│   │   ├── create/      # Adventure generation
│   │   ├── plans/       # Saved adventures
│   │   ├── profile/     # User profile
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── contexts/        # Context providers
│   ├── lib/             # Utilities and helpers
│   ├── services/        # API services
│   └── types/           # TypeScript definitions
└── public/              # Static assets
```

## Key Features

- **Discover** (Home): Browse community adventures
- **Create**: AI-powered adventure generation with detailed filters
- **Plans**: Manage, schedule, and track adventures
- **Profile**: Account settings and preferences
- **Subscription**: Stripe-powered tier management

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
cd motion-web
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Page Structure

- `/` - Discover (Home): Community adventures feed
- `/create` - AI adventure generation
- `/plans` - Saved adventures with calendar view
- `/profile` - User settings and preferences
- `/auth/*` - Authentication pages

## Deployment

The web app is deployed on Vercel:
- **Production**: https://app.motionflow.app
- **Preview**: Auto-deployed on pull requests

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Development Notes

- **Home = Discover**: The root page (`/`) serves as the Discover/community feed
- **Server Components**: Using Next.js App Router with server and client components
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Authentication**: Google OAuth primary, email/password supported

---

For more information, see the [main README](../README.md)


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
