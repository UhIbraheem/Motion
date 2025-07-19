# Motion App - Setup & Running Guide

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
EXPO_PUBLIC_API_URL=http://192.168.4.30:5000
EXPO_PUBLIC_SUPABASE_URL=https://zhroxsksewvoipaufpsk.supabase.co
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
8. **Check Supabase** → adventures table for saved data

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
