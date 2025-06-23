# Motion Frontend

AI-Powered Local Adventure Planning App built with React Native & Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone

### Installation
```bash
cd Motion/frontend
npm install
```

## 📱 Running the App

### iOS Simulator
```bash
npm run ios
```
*Requires Xcode on macOS*

### Android Emulator  
```bash
npm run android
```
*Requires Android Studio*

### Physical Device (Recommended)
```bash
npm start
# Scan QR code with Expo Go app
```

### Web Browser
```bash
npm run web
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── shared/           # Reusable components
│   │   └── MotionLogo.tsx
│   ├── Button.tsx        # UI components
│   ├── Card.tsx
│   └── Input.tsx
├── navigation/           # App navigation
├── screens/             # App screens
├── context/             # React context
└── utils/               # Utility functions
```

## 🎨 Assets

Place your assets in:
```
assets/
├── icon.png             # App icon
├── splash.png           # Splash screen
├── favicon.ico          # Web favicon
└── icons/               # Tab bar icons
    ├── discover.png
    ├── curate.png
    ├── plans.png
    └── profile.png
```

## 🔧 Environment Setup

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=your_backend_url
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🚢 Deployment

### Build for App Stores
```bash
npm run build:ios
npm run build:android
```

### Submit to Stores
```bash
npm run submit:ios
npm run submit:android
```

## 🎯 Key Features

- ✨ AI-powered adventure curation
- 🌊 Mood-based recommendations  
- 📱 Beautiful, responsive design
- 🎨 Consistent Motion branding
- 🔐 Secure authentication
- 📊 User preferences & history

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** React Navigation 6
- **Styling:** NativeWind (Tailwind CSS)
- **Authentication:** Supabase
- **State Management:** React Context
- **Language:** TypeScript

## 📞 Support

For issues or questions, contact the Motion team.