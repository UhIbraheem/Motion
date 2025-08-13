# Motion App - Development Instructions for AI Assistant

## 🌊 Project Overview & Vision

**Motion** is a premium AI-powered local adventure discovery platform positioned as "Airbnb for experiences." The app embodies a "go with the flow" philosophy - mindful, curated exploration that makes users feel like local insiders.

**Core Value Proposition:** Users input their mood, preferences, and constraints → AI generates personalized step-by-step local adventure plans → Users save, schedule, complete, and share experiences with the community.

**Brand Identity:**

- **Colors:** Sage green (#3c7660), warm gold (#f2cc6c), cream (#f8f2d5), teal (#4d987b)
- **Design:** Apple-inspired minimalism, glassmorphism, clean typography, generous white space
- **Aesthetic:** Premium lifestyle platform, sophisticated but approachable

## 🏗️ Current Technical Architecture

### **Frontend Platforms:**

```
Motion/
├── frontend/              # React Native + Expo (mobile)
├── motion-web/           # Next.js 14 (web app)
├── motion-landing/       # Next.js (landing page)
└── backend/              # Node.js + Express (Railway hosted)
```

### **Tech Stack:**

- **Mobile:** React Native + Expo + TypeScript + NativeWind (Tailwind)
- **Web:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend:** Node.js + Express + TypeScript (deployed on Railway)
- **Database:** Supabase (PostgreSQL with auth)
- **Payments:** Stripe integration (web-first, mobile later)
- **AI:** OpenAI GPT-4 for adventure generation

### **Domains:**

- **Landing:** motionflow.app (Vercel)
- **Web App:** app.motionflow.app (Vercel)
- **API:** api.motionflow.app (Railway)

## 🎯 Development Priorities & Guidelines

### **Cross-Platform Consistency Rules:**

1. **Feature Parity:** Every feature on mobile MUST exist on web (and vice versa)
2. **Design Uniformity:** Same colors, typography, spacing, component hierarchy
3. **Data Sync:** Shared Supabase database ensures universal user experience
4. **Authentication:** Same Google OAuth flow, same user accounts across platforms

### **Code Quality Standards:**

- **No Redundancy:** Create shared utilities for common functions
- **TypeScript:** Strict typing throughout, shared interfaces between platforms
- **Component Libraries:** Reusable components with consistent props/behavior
- **Modern Practices:** React 18 patterns, proper error boundaries, accessibility

### **Design System Enforcement:**

- **Colors:** Always use Motion brand colors, never hardcoded hex values
- **Typography:** Consistent font hierarchy across platforms
- **Spacing:** Use standardized spacing scale (4px, 8px, 16px, 24px, 32px)
- **Components:** Uniform button styles, card layouts, input fields, modals

## 💳 Stripe Payment Integration (Web-First Strategy)

### **Subscription Tiers:**

```typescript
interface SubscriptionTier {
  name: "seeker" | "explorer" | "navigator";
  price: 0 | 6.0 | 10.99;
  features: {
    generations_per_month: number; // 10 | -1 | -1 (-1 = unlimited)
    edits_per_adventure: number; // 3 | -1 | -1
    premium_filters: boolean; // false | true | true
    multi_day_itineraries: boolean; // false | false | true
  };
}
```

### **Implementation Requirements:**

- **Stripe Products:** Create in Stripe dashboard for each tier
- **Webhook Handling:** Railway backend processes subscription events
- **Usage Tracking:** Supabase stores user consumption and limits
- **Upgrade Flow:** Seamless web-based subscription management
- **Feature Gates:** Consistent enforcement across mobile and web

### **Payment Flow:**

1. User hits generation limit on any platform
2. Redirect to web app subscription page
3. Stripe handles payment processing
4. Webhook updates Supabase user tier
5. All platforms immediately reflect new permissions

## 🔐 Supabase Integration Architecture

### **Authentication Strategy:**

- **Google OAuth:** Primary sign-in method (web and mobile)
- **Universal Accounts:** Same user_id across all platforms
- **Session Management:** Supabase handles tokens and refresh

### **Database Schema:**

```sql
-- Core tables (already implemented)
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

```

### **Row Level Security (RLS):**

- Users can only access their own data
- Public adventures visible to all authenticated users
- Subscription tier enforcement at database level

## 🚀 Backend API (Railway Deployment)

### **Current Structure:**

```
backend/
├── src/
│   ├── routes/
│   │   ├── adventures.js    # AI generation endpoints
│   │   ├── auth.js         # Authentication routes
│   │   └── payments.js     # Stripe webhook handling
│   ├── middleware/         # Auth, rate limiting, validation
│   ├── services/           # OpenAI, Supabase integrations
│   └── utils/              # Shared utilities
```

### **Railway Configuration:**

- **Environment Variables:** OpenAI key, Supabase keys, Stripe secrets
- **Auto-deploy:** Connected to GitHub main branch
- **Custom Domain:** api.motionflow.app points to Railway service

### **API Endpoints:**

```typescript
POST /api/adventures/generate    # AI adventure creation
GET  /api/adventures/user       # User's adventures
POST /api/adventures/save       # Save community adventure
POST /api/community/share       # Share completed adventure
POST /api/payments/webhook      # Stripe subscription events
```

## 📱 Mobile Frontend (React Native + Expo)

### **Key Components:**

- **AppNavigator:** Bottom tab navigation with floating glass effect
- **CurateScreen:** Adventure generation with filters and AI integration
- **DiscoverScreen:** Community feed with infinite scroll
- **PlansScreen:** Personal adventure library with calendar
- **ProfileScreen:** Settings, subscription management, preferences

### **Navigation Structure:**

```typescript
type RootStackParamList = {
  Discover: undefined;
  Create: undefined; // AI adventure generation
  Plans: undefined; // Personal library
  Profile: undefined; // Settings & account
};
```

### **Styling Guidelines:**

- **NativeWind:** Tailwind CSS for React Native
- **Consistent Colors:** Use Motion brand variables
- **Typography:** Clear hierarchy with readable font sizes
- **Touch Targets:** Minimum 44px for accessibility

## 🌐 Web Frontend (Next.js 14)

### **App Structure:**

```
motion-web/src/
├── app/                    # Next.js 14 App Router
│   ├── discover/page.tsx  # Community feed
│   ├── create/page.tsx    # Adventure generator
│   ├── plans/page.tsx     # Personal library
│   └── profile/page.tsx   # Account settings
├── components/            # Shared UI components
├── lib/                   # Utilities (Supabase, Stripe)
└── types/                 # TypeScript definitions
```

### **Component Library:**

- **shadcn/ui:** Primary component system
- **Custom Components:** Motion-branded extensions
- **Responsive Design:** Mobile-first approach
- **Performance:** Server-side rendering for public content

## 🎨 Design System Implementation

### **Color Variables:**

- THESE ARE ACCENT COLORS ONLY, MAIN COLOR FOR APP BACKGROUNDS ARE THE CURRENT IMPLEMNETATIONS OF WHITE

```css
:root {
  --sage: #3c7660;
  --sage-light: #4d987b;
  --gold: #f2cc6c;
  --cream: #f8f2d5;
  --teal: #4d987b;
}
```

### **Component Consistency:**

- **Buttons:** Same sizing, colors, hover states across platforms
- **Cards:** Consistent padding, shadows, border radius
- **Forms:** Uniform input styling, validation, error states
- **Modals:** Same animation timing, backdrop blur, positioning

### **Typography Scale:**

- **Headings:** 32px, 24px, 20px, 18px (consistent across platforms)
- **Body:** 16px base, 14px secondary, 12px caption
- **Line Height:** 1.5 for readability
- **Font Weight:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## 📋 Development Workflow & Best Practices

### **Feature Development Process:**

1. **Define Requirements:** Ensure feature works on both platforms
2. **Create Shared Types:** TypeScript interfaces in both codebases
3. **Backend First:** API endpoints before frontend implementation
4. **Mobile Implementation:** React Native components and screens
5. **Web Implementation:** Next.js pages and components
6. **Testing:** Cross-platform functionality and design consistency
7. **Deployment:** Backend to Railway, frontends to Vercel

### **Code Organization:**

- **Shared Types:** Maintain identical interfaces in both frontends
- **API Integration:** Consistent error handling and loading states
- **Component Reuse:** Similar component structure across platforms
- **Utility Functions:** Keep business logic consistent

### **Testing Requirements:**

- **Authentication:** Google OAuth works on both platforms
- **Data Sync:** Changes on mobile appear on web (and vice versa)
- **Subscription:** Payment flow updates permissions everywhere
- **UI Consistency:** Visual parity between platforms

## 🚀 Current Development Status

### **Completed Features:**

✅ Supabase authentication and database
✅ OpenAI adventure generation
✅ Basic mobile app with navigation
✅ Landing page deployed
✅ Backend API structure
✅ Basic web app framework

### **In Progress:**

🔄 Stripe payment integration
🔄 Cross-platform design consistency
🔄 Community sharing features
🔄 Advanced filtering system

### **Next Priorities:**

1. **Stripe Integration:** Complete web-based subscription system
2. **Design Polish:** Ensure visual parity between mobile and web
3. **Feature Completion:** All screens functional on both platforms
4. **Performance:** Optimize loading times and responsiveness
5. **Testing:** Comprehensive cross-platform validation

## 🎯 Success Criteria for Each Task

### **When Adding New Features:**

- [ ] Works identically on mobile and web
- [ ] Uses consistent Motion design language
- [ ] Integrates with existing authentication/database
- [ ] Follows TypeScript best practices
- [ ] Includes proper error handling
- [ ] Maintains performance standards

### **When Refactoring Code:**

- [ ] Eliminates redundancy between platforms
- [ ] Improves maintainability
- [ ] Preserves existing functionality
- [ ] Enhances code readability
- [ ] Maintains design consistency
- [ ] Is error free

### **When Implementing Design:**

- [ ] Matches Motion brand guidelines exactly
- [ ] Responsive across all screen sizes
- [ ] Accessible (proper contrast, touch targets)
- [ ] Smooth animations and transitions
- [ ] Consistent with existing components

## 🔧 Technical Commands & References

### **Development Commands:**

```bash
# Mobile development
cd frontend && yarn expo start

# Web development
cd motion-web && npm run dev

# Backend testing
cd backend && npm run dev

# Deployment (automatic via Git)
git push origin main  # Triggers Railway + Vercel deploys update
```

### **Environment Variables Required:**

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📚 Key Resources & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Stripe Integration:** https://stripe.com/docs/subscriptions
- **Next.js 14:** https://nextjs.org/docs
- **React Native:** https://reactnative.dev/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Remember:** Motion is positioned as a premium lifestyle platform. Every feature, design decision, and code implementation should reflect sophistication, reliability, and attention to detail. Users should feel like they're using a product worth paying for - one that genuinely enhances their local exploration experience, wether that be where theyre from or when traveling to a new place. motion will make it easy.
