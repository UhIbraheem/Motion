# Motion - Setup Instructions

## Prerequisites
- **Node.js 18.x or higher** (you have v22.20.0 ✅)
- **npm** (comes with Node.js)
- Git installed

---

## Quick Setup (Run these commands)

### 1. Backend Setup
Open PowerShell or Command Prompt in the backend directory:

```powershell
cd C:\Users\aby20\OneDrive\Desktop\Motion\backend
npm install
```

**Key packages that will be installed:**
- `tiktoken` - Token counting for AI costs
- `openai` - OpenAI API client
- `axios` - HTTP requests
- `express` - Web server
- `@supabase/supabase-js` - Database
- `dotenv` - Environment variables

### 2. Frontend Setup (Web App)
Open a **new** PowerShell window in the frontend directory:

```powershell
cd C:\Users\aby20\OneDrive\Desktop\Motion\motion-web
npm install
```

**Key packages that will be installed:**
- `next` - Next.js framework
- `react`, `react-dom` - React library
- `date-fns`, `react-day-picker` - Calendar components (just added ✅)
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

## Environment Variables

### Backend `.env` file
Create `C:\Users\aby20\OneDrive\Desktop\Motion\backend\.env`:

```env
OPENAI_API_KEY=sk-proj-your-key-here
GOOGLE_PLACES_API_KEY=AIzaSy-your-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
```

### Frontend `.env.local` file
Create `C:\Users\aby20\OneDrive\Desktop\Motion\motion-web\.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Running the Application

### Start Backend (Terminal 1)
```powershell
cd C:\Users\aby20\OneDrive\Desktop\Motion\backend
node index.js
```

**You should see:**
```
✅ Google Places API v1 initialized with rate limiting
✅ Geocoding Service initialized
🚀 Server running on port 3001
```

### Start Frontend (Terminal 2)
```powershell
cd C:\Users\aby20\OneDrive\Desktop\Motion\motion-web
npm run dev
```

**You should see:**
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
✓ Ready in 2.5s
```

### Access the App
Open browser to: **http://localhost:3000**

---

## Troubleshooting

### Error: "Cannot find module 'tiktoken'"
**Solution:** Run `npm install` in the backend directory

### Error: "Cannot find module 'date-fns'"
**Solution:** Run `npm install` in the motion-web directory (already fixed ✅)

### Error: "Port 3001 already in use"
**Solution:** Kill the process or change PORT in backend `.env`

```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Error: "ENOENT: no such file or directory, open '.env'"
**Solution:** Create the `.env` files as shown above

---

## Testing the AI Features

Once both backend and frontend are running:

1. **Sign In/Sign Up** at http://localhost:3000
2. **Create Adventure** - Click "New Adventure"
3. **Fill Filters:**
   - Location: "Miami, FL" (try different cities!)
   - Duration: Half Day
   - Budget: Moderate
   - Experience Types: Pick 2-3 (e.g., Foodie, Hidden Gems)
4. **Generate** - Wait ~10-15 seconds
5. **View Cost** - You'll see the token usage badge showing:
   - Cost breakdown (input/output)
   - Cache hit status (if second generation)
   - Potential savings

---

## Package Installation Summary

I've already added these packages for you:
- ✅ `tiktoken@1.0.22` - Already in backend/package.json
- ✅ `date-fns@latest` - Just installed for frontend
- ✅ `react-day-picker@latest` - Just installed for frontend

**You just need to run `npm install` in both directories on your Windows machine!**

---

## Next Steps After Setup

1. **Test AI Generation** - Create a few adventures to see token costs
2. **Check Cache** - Generate same filters twice to see cache hit
3. **View Plans** - Save adventures and view them in Plans page
4. **Schedule Adventures** - Use the calendar picker to schedule

---

## Support

If you encounter any issues:
1. Check both terminals for error messages
2. Verify `.env` files exist and have correct values
3. Make sure both servers are running (backend on 3001, frontend on 3000)
4. Check browser console (F12) for frontend errors

---

**Last Updated:** 2024-11-22
