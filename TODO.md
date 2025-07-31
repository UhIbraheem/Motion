# Motion Web App - Base44 Integration Todo List

## 🎯 Project Goal

Convert Base44-generated web app mockup into production-ready Next.js app that matches Motion mobile app design and connects to existing Supabase backend.

## 📋 Phase 1: Foundation Setup

- [x] Create Next.js project with TypeScript + Tailwind
- [x] Install shadcn/ui components
- [x] Create directory structure
- [x] Set up Supabase client
- [x] Create page placeholders
- [ ] Install remaining dependencies
- [ ] Configure environment variables (.env.local)
- [ ] Test basic Next.js setup runs locally

## 📋 Phase 2: Base44 Code Migration

### 2.1 Entity Layer

- [ ] Copy Base44 `entities/Adventure.ts` to `src/entities/`
      (i will transfer base 44 code into the proper working directory)
- [ ] Update Adventure entity to match mobile app schema
- [ ] Create TypeScript interfaces in `src/types/`
- [ ] Add User entity and other needed types

### 2.2 Component Migration

- [ ] Copy Base44 discover components:
  - [ ] `AdventureCard` → `src/components/discover/`
  - [ ] `AdventureFilters` → `src/components/discover/`
  - [ ] `TrendingSection` → `src/components/discover/`
- [ ] Copy Base44 create components:
  - [ ] `AdventureForm` → `src/components/create/`
  - [ ] `GeneratedAdventures` → `src/components/create/`
  - [ ] `LoadingAnimation` → `src/components/create/`
- [ ] Copy Base44 plans components:
  - [ ] `SavedAdventures` → `src/components/plans/`
  - [ ] `ScheduledAdventures` → `src/components/plans/`
  - [ ] `CompletedAdventures` → `src/components/plans/`
  - [ ] `AdventureCalendar` → `src/components/plans/`
- [ ] Copy Base44 profile components:
  - [ ] `AccountSettings` → `src/components/profile/`
  - [ ] `PreferenceSettings` → `src/components/profile/`
  - [ ] `SubscriptionSettings` → `src/components/profile/`

### 2.3 Page Migration

- [ ] Copy Base44 `pages/discover` → `src/app/discover/page.tsx`
- [ ] Copy Base44 `pages/create` → `src/app/create/page.tsx`
- [ ] Copy Base44 `pages/plans` → `src/app/plans/page.tsx`
- [ ] Copy Base44 `pages/profile` → `src/app/profile/page.tsx`
- [ ] Update all import paths to Next.js structure

### 2.4 Fix Import Paths & TypeScript Errors

- [ ] Update all component imports to use `@/` alias
- [ ] Fix shadcn/ui component imports
- [ ] Resolve TypeScript errors
- [ ] Ensure all Lucide icons are imported correctly
- [ ] Test each page loads without errors

## 📋 Phase 3: Motion Brand Integration

### 3.1 Color System

- [ ] Replace Base44 CSS variables with Motion brand colors:
  - [ ] `--sage` → `#3c7660`
  - [ ] `--sage-dark` → `#2d5a47`
  - [ ] `--gold` → `#f2cc6c`
  - [ ] `--cream` → `#f8f2d5`
  - [ ] `--teal` → `#4d987b`
- [ ] Update Tailwind config with Motion brand colors
- [ ] Create custom CSS variables for consistent theming

- th ewexisting base44 code style is nice, but update it to match the appunique style we created inn terms of color schemes and things like that keep it resembling the app

### 3.2 Component Styling

- [ ] Style AdventureCard to match mobile app cards
- [ ] Update button styles to match Motion mobile buttons
- [ ] Apply Motion typography (fonts, sizing, spacing)
- [ ] Add Motion-style shadows and borders
- [ ] Implement floating glass navigation bar (optional)

### 3.3 Layout & Navigation

- [ ] Create navigation header matching mobile app style
- [ ] Add Motion logo and branding elements
- [ ] Implement responsive design for mobile/tablet/desktop
- [ ] Add loading states and empty states with Motion styling

## 📋 Phase 4: Supabase Integration

### 4.1 Authentication

- [ ] Replace Base44 auth with Supabase Auth
- [ ] Implement login/signup forms
- [ ] Add protected route middleware
- [ ] Test universal login (same credentials as mobile)

### 4.2 Database Integration

- [ ] Replace Base44 data layer with Supabase client calls
- [ ] Update Adventure CRUD operations
- [ ] Implement user profile management
- [ ] Add adventure sharing functionality
- [ ] Test data sync between web and mobile

### 4.3 API Integration

- [ ] Connect to existing Node.js backend for AI generation
- [ ] Implement adventure creation flow
- [ ] Add OpenTable booking integration
- [ ] Test AI adventure generation works

## 📋 Phase 5: Feature Enhancement

### 5.1 Core Functionality

- [ ] Implement adventure filtering and search
- [ ] Add adventure saving/bookmarking
- [ ] Implement adventure scheduling
- [ ] Add community sharing features
- [ ] Test complete user journey

### 5.2 Advanced Features

- [ ] Add photo upload for adventures
- [ ] Implement user preferences sync
- [ ] Add notification system
- [ ] Implement adventure completion tracking
- [ ] Add rating and review system

## 📋 Phase 6: Stripe Integration & Monetization

### 6.1 Subscription Setup

- [ ] Install and configure Stripe
- [ ] Create subscription plans (Free, Motion+ Premium $9.99/mo)
- [ ] Implement pricing page
- [ ] Add subscription management
- [ ] Test payment flow

### 6.2 Premium Features

- [ ] Gate premium features behind subscription
- [ ] Implement usage limits for free tier
- [ ] Add billing management
- [ ] Test subscription upgrade/downgrade

## 📋 Phase 7: Production Readiness

### 7.1 Performance & SEO

- [ ] Optimize images and assets
- [ ] Implement Next.js best practices (ISR, SSG)
- [ ] Add meta tags and SEO optimization
- [ ] Test performance with Lighthouse

### 7.2 Deployment

- [ ] Configure environment variables for production
- [ ] Set up Vercel deployment
- [ ] Configure custom domain (app.motionflow.app)
- [ ] Test production deployment
- [ ] Set up monitoring and analytics

## 📋 Phase 8: Testing & Launch

### 8.1 Quality Assurance

- [ ] Test all user flows end-to-end
- [ ] Test responsive design on all devices
- [ ] Cross-browser compatibility testing
- [ ] Performance testing under load

### 8.2 Launch Preparation

- [ ] Create user onboarding flow
- [ ] Add help documentation
- [ ] Set up customer support system
- [ ] Plan marketing and user acquisition

---

## 🎨 Motion Brand Guidelines

**Primary Colors:**

- Sage Green: `#3c7660`
- Light Sage: `#4d987b`
- Gold Accent: `#f2cc6c`
- Cream Background: `#f8f2d5`

**Design Philosophy:**

- Elegant, energetic, minimal
- Premium lifestyle platform aesthetic
- "Go with the flow" mindful experience
- Sophisticated like Airbnb for experiences

## 🔧 Technical Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **UI Components:** shadcn/ui + Lucide React icons
- **Database:** Supabase (shared with mobile app)
- **Auth:** Supabase Auth (universal login)
- **Payments:** Stripe subscriptions
- **Deployment:** Vercel
- **Domain:** app.motionflow.app

## 📱 Mobile App Sync Requirements

- Same user accounts across web and mobile
- Shared adventure data and preferences
- Consistent design language and UX patterns
- Universal adventure creation and sharing

---

## 🚀 Current Status: Phase 1 Complete

**Next Priority:** Phase 2 - Base44 Code Migration

**Goal:** Revenue-generating web app in 2-3 weeks

mobile to do list
add google review data for each business, verifying existence
and getting crucial info like business hours dates closed etc
get pictures from google review
s and use them instead of splash images

\*\* I used this for the components instead The 'shadcn-ui' package is deprecated. Please use the 'shadcn' package instead:

npx shadcn@latest init
ins
tead of the ui version 