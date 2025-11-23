# Google Cloud Setup - Fix "REQUEST_DENIED" Errors

## ❌ Current Problem
```
⚠️ Geocoding returned status: REQUEST_DENIED
📍 Using default coordinates for fort lauderdale
```

This error means the **Geocoding API** is not enabled in your Google Cloud project.

---

## ✅ Solution: Enable Geocoding API

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com
2. Select your project (the one with your API key)

### Step 2: Enable Geocoding API
1. In the search bar at the top, type: **"Geocoding API"**
2. Click on "Geocoding API"
3. Click the **"Enable"** button
4. Wait ~30 seconds for it to activate

### Step 3: Verify Your APIs Are Enabled
You should have these 3 APIs enabled:
- ✅ **Places API (New)** - For business search
- ✅ **Geocoding API** - For converting addresses to coordinates
- ✅ **Maps JavaScript API** - (Optional, for frontend maps)

### Step 4: Check API Key Restrictions
1. Go to "APIs & Services" → "Credentials"
2. Click on your API key
3. Under "API restrictions", make sure these are allowed:
   - Places API (New)
   - Geocoding API
   - Maps JavaScript API (if using maps)

---

## 🔑 API Key Configuration

Your backend `.env` should have:
```env
GOOGLE_PLACES_API_KEY=AIzaSy...your-key-here
```

This same key is used for:
- Google Places API v1 (business search)
- Geocoding API (address → lat/lng)

---

## 💰 Cost Estimate

### Geocoding API Pricing
- **FREE:** First $200/month credit from Google
- **After free tier:** $5 per 1,000 requests
- **Your usage:** ~10-20 requests per adventure generation
- **Cost per adventure:** ~$0.05-0.10 for geocoding

### Monthly Cost Estimate (1,000 adventures/month)
- Geocoding: $50-100
- Places API: $150-300
- OpenAI GPT-4o: $100-200
- **Total:** ~$300-600/month

**Revenue needed to break even:** ~30-60 premium subscribers @ $9.99/mo

---

## 🧪 Test After Enabling

### Backend Test (Terminal):
```bash
cd C:\Users\aby20\OneDrive\Desktop\Motion\backend
node index.js
```

### Generate an Adventure:
1. Go to http://localhost:3000/create
2. Fill in:
   - Location: Fort Lauderdale, FL
   - Duration: Half Day
   - Budget: Moderate
   - Pick 2-3 experience types
3. Click "Create Adventure"

### Check Logs - Should See:
```
✅ Found: "Brew Urban Cafe" | Status: OPERATIONAL | Rating: 4.5
✅ Found: "Green Bar & Kitchen" | Status: OPERATIONAL | Rating: 4.7
📊 Validation rate: 6/6 (100%)
```

**No more:**
```
❌ Error looking up [business]: fn is not a function
⚠️ Geocoding returned status: REQUEST_DENIED
```

---

## 🚨 Troubleshooting

### Still getting REQUEST_DENIED after enabling?
1. **Wait 2-3 minutes** for changes to propagate
2. **Restart backend server** (Ctrl+C then `node index.js`)
3. **Check billing** is enabled in Google Cloud Console
4. **Verify API key** is correct in `.env` file

### Getting ZERO_RESULTS?
- This is OK! Means API is working, just no results found
- Try more specific business names
- Check the location string is correct

### Rate Limit Errors?
- You've exceeded free tier or rate limits
- Wait a few minutes or upgrade billing

---

## 📊 Monitor API Usage

### View API Calls in Google Cloud:
1. Go to "APIs & Services" → "Dashboard"
2. Click on "Geocoding API"
3. See charts for:
   - Requests per day
   - Errors
   - Latency

### Set Up Budget Alerts:
1. Go to "Billing" → "Budgets & alerts"
2. Create budget alert for $50/month
3. Get email when 80% spent

---

**After enabling Geocoding API, your validation rate should jump from 0% to 80-100%!** 🎉
