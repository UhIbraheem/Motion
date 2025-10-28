# Motion 🌊

**AI-powered local adventure discovery platform**

Motion helps you discover personalized local experiences and adventures using AI. Input your mood, preferences, and constraints through custom filters, and get curated step-by-step adventure plans tailored to your location and preferences.

## What is Motion?

Motion is a cross-platform application that makes exploring your local area feel like having a personal adventure guide. Whether you're a local looking for something new or traveling to a new city, Motion creates customized itineraries that match your vibe, budget, and time.

**Core Features:**
-  AI-powered adventure generation using GPT-4
-  Google Places integration for verified locations
-  Schedule and track your adventures
-  Step-by-step guided experiences
-  Community discovery and sharing
-  Available on Web and Mobile (iOS/Android)

## Project Structure

```
Motion/
├── frontend/           # React Native mobile app (Expo)
├── motion-web/        # Next.js 14 web application  
├── motion-landing/    # Landing page (motionflow.app)
├── backend/           # Node.js + Express API (Railway)
└── shared/            # Shared services and utilities
```

## Tech Stack

- **Mobile**: React Native + Expo + TypeScript + NativeWind
- **Web**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4.1
- **Maps**: Google Places API
- **Auth**: Supabase Auth + (Google OAuth) 

## Getting Started (Dev)

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (for mobile)
- Supabase account
- OpenAI API key
- Google Places API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UhIbraheem/Motion.git
   cd Motion
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Web app
   cd ../motion-web && npm install
   
   # Mobile app
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local` in each directory
   - Add your API keys (Supabase, OpenAI, Google Places)

4. **Run the applications**
   
   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Web:**
   ```bash
   cd motion-web
   npm run dev
   ```
   
   **Mobile:**
   ```bash
   cd frontend
   npx expo start
   ```

## Quick Start Scripts

Windows users can use the provided batch files:
- `start-web.bat` - Start web app
- `start-mobile.bat` - Start mobile app

## Documentation

- [Frontend README](./frontend/README.md) - Mobile app setup
- [Motion Web README](./motion-web/README.md) - Web app setup
- [Backend README](./backend/README.md) - API documentation
- [Developer Guide](./.github/copilot-instructions.md) - Full development guide

## Deployment

- **Web App**: Vercel (app.motionflow.app)
- **Landing**: Vercel (motionflow.app)
- **Backend**: Railway (api.motionflow.app)
- **Database**: Supabase

## License

Proprietary - All Rights Reserved

---

**Built with ❤️ for adventure seekers everywhere**
 App - Setup & Running Guide

AI-Powered Local Adventure Planning App

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go app** on your phone (iOS/Android)
- **Supabase account** with project set up

## 📱 Frontend Setup (React Native)

### 1. Navigate to Frontend

```bash
cd Motion/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `frontend/.env` file:

```bash
# Replace with YOUR actual values
EXPO_PUBLIC_API_URL=http://192.111.4.33:5000
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**Important**: Replace `192.168.4.30` with YOUR computer's IP address!

### 4. Find Your IP Address

**On Mac:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**

```bash
ipconfig
```

Look for your **IPv4 Address** (usually starts with 192.168.x.x)

### 5. Run Frontend

```bash
npx expo start --clear
```

## 🖥️ Backend Setup (Express.js + OpenAI)

### 1. Navigate to Backend

```bash
cd Motion/backend
```

### 2. Install Dependencies (if needed)

```bash
npm install
```

### 3. Environment Configuration

Create/check `backend/.env` file:

```bash
PORT=5000
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Run Backend

```bash
node index.js
```

**Should see:**

```
🚀 Server running on http://0.0.0.0:5000
📱 Mobile access: http://[YOUR_IP]:5000
💻 Local access: http://localhost:5000
```

## 🔗 Testing Connection

### 1. Test Backend Accessibility

Open your phone's browser and go to:

```
http://192.168.4.30:5000
```

_(Replace with your actual IP)_

**Should see:** "Motion backend is live 🚀"

### 2. Test Mobile App

1. Open Expo Go on your phone
2. Scan QR code from `npx expo start`
3. App should load and connect to backend

## 🗄️ Database (Supabase)

### Current Setup

- **Authentication**: ✅ Working (users can sign up/login)
- **Database Schema**: ✅ Created (`profiles`, `adventures` tables)
- **Adventure Saving**: ✅ Should work with latest code

### Check Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. **Authentication** → **Users** (see registered users)
3. **Table Editor** → **adventures** (see saved adventures)

## 🧪 Testing Current Features

### What Works:

1. **User Registration/Login** ✅
2. **AI Adventure Generation** ✅
3. **Step-by-step editing** ✅
4. **Adventure saving to database** ✅ (with latest fixes)

### Testing Flow:

1. **Register/Login** to create account
2. **Go to Curate tab**
3. **Enter location** (e.g., "Miami, FL")
4. **Set preferences** (duration, budget, vibe)
5. **Generate adventure**
6. **Edit individual steps** (tap any step)
7. **Save adventure** (should see success message)

## 🛠️ Development vs Production Setup

### 🔧 Local Development Testing

For testing new features and debugging before deploying:

#### Backend (Port 3001)

```bash
cd Motion/backend
node index.js
```

**Expected output:**

```
🚀 Motion API successfully started!
📱 Local access: http://localhost:3001
🤖 AI test: http://localhost:3001/api/ai/test
```

#### Frontend Web App (Port 3000)

```bash
cd Motion/motion-web
npm run dev
```

#### Frontend Configuration

Edit `motion-web/.env.local`:

```bash
# FOR LOCAL DEVELOPMENT - Uncomment this line:
NEXT_PUBLIC_API_URL=http://localhost:3001

# FOR PRODUCTION - Comment this line:
# NEXT_PUBLIC_API_URL=
```

**Benefits:**

- ✅ Test OpenAI Structured Outputs locally
- ✅ See backend logs in real-time
- ✅ Debug API calls before pushing to production
- ✅ Faster development cycle

### 🚀 Production Deployment

For live testing and production use:

#### Backend Deployment

Railway automatically deploys when you push to `main` branch:

```bash
git checkout main
git merge dev
git push origin main
```

#### Frontend Configuration

Edit `motion-web/.env.local`:

```bash
# FOR LOCAL DEVELOPMENT - Comment this line:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# FOR PRODUCTION - Uncomment this line:
NEXT_PUBLIC_API_URL=https://motion-backend-production.up.railway.app
```

#### Frontend Deployment

Vercel automatically deploys web app from your repository.

**Benefits:**

- ✅ Live testing with real Railway infrastructure
- ✅ Production-grade performance
- ✅ Real-world API response times
- ✅ Shared testing with team/users

### 🔄 Quick Environment Switching

**Switch to Local Development:**

1. Start backend: `npm run dev`
2. Edit `motion-web/.env.local` → uncomment localhost URL
3. Start frontend: `cd motion-web && npm run dev`

**Switch to Production:**

1. Edit `motion-web/.env.local` → uncomment Railway URL
2. Restart frontend if running: `npm run dev`

**Pro Tip:** Keep both URLs in `.env.local` as comments for easy switching! 8. **Check Supabase** → adventures table for saved data

## 🐛 Common Issues & Solutions

### Issue: "Network request failed"

**Solution:**

- Check your IP address in `frontend/.env`
- Make sure backend is running on correct port
- Test backend URL in phone browser first

### Issue: Backend won't start

**Solution:**

```bash
cd backend
npm install express cors dotenv openai
node index.js
```

### Issue: Expo won't start

**Solution:**

```bash
cd frontend
npx expo install --fix
npx expo start --clear
```

### Issue: Supabase errors

**Solution:**

- Check your Supabase URL and anon key in `.env`
- Verify database schema is created
- Check Supabase dashboard for errors

## 📂 Project Structure

```
Motion/
├── backend/                 # Express.js API
│   ├── routes/ai.js        # OpenAI integration
│   ├── index.js            # Server entry point
│   └── .env                # Backend environment
├── frontend/               # React Native app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── .env                # Frontend environment
└── motion-landing/         # Next.js landing page
```

## 🔄 Development Workflow

### Daily Startup:

1. **Start Backend:**

   ```bash
   cd Motion/backend && node index.js
   ```

2. **Start Frontend:**

   ```bash
   cd Motion/frontend && npx expo start
   ```

3. **Open on Phone:** Scan QR code with Expo Go

### When Making Changes:

- **Backend changes:** Restart `node index.js`
- **Frontend changes:** Auto-reload in Expo
- **Environment changes:** Restart both servers

## 🎯 Current Development Status

### ✅ Completed:

- User authentication (Supabase)
- AI adventure generation (OpenAI)
- Step-by-step editing
- Adventure saving to database
- Beautiful UI with Motion branding

### 🔄 Next Up:

- Enhanced Profile screen with real user data
- Plans screen showing saved adventures
- Discover screen with community features
- Image integration (Unsplash API)

## 🆘 Need Help?

### Check Logs:

- **Frontend:** Expo console in terminal
- **Backend:** Node.js console output
- **Database:** Supabase dashboard logs

### Debug Mode:

All console.log statements are included for debugging. Check:

- Network requests
- Database operations
- Authentication flows

**Everything should work smoothly now! 🚀**
