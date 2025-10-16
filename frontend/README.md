# Motion Mobile App 📱

React Native mobile application for Motion - AI-powered local adventure discovery.

## Overview

The Motion mobile app provides a native iOS and Android experience for discovering and tracking local adventures. Built with React Native and Expo for cross-platform compatibility.

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation
- **State Management**: React Context
- **Auth**: Supabase Auth
- **Database**: Supabase

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── context/         # Context providers (Auth, Theme, Preferences)
│   ├── services/        # API and service integrations
│   ├── utils/           # Helper functions
│   ├── constants/       # Theme, assets, config
│   └── types/           # TypeScript type definitions
├── assets/              # Images, fonts, icons
└── app.config.js        # Expo configuration
```

## Key Features

- **Discover**: Browse AI-generated local adventures (Home screen)
- **Create**: Generate custom adventures with AI
- **Plans**: Manage saved and scheduled adventures
- **Profile**: User settings and preferences

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npx expo start
```

### Run on Device

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web (for testing)
npx expo start --web
```

## Environment Variables

Create `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_BACKEND_URL=your_backend_url
```

## Navigation Structure

- **Discover** (Home): Community adventures feed
- **Create**: AI adventure generation
- **Plans**: Personal adventure library
- **Profile**: Settings and account management

## Development Notes

- **Home Screen = Discover Screen**: The Discover tab is the default home screen
- **Theme**: Uses Motion brand colors (sage green, warm gold, cream)
- **Auth**: Google OAuth via Supabase
- **Deep Linking**: Configured for email verification flows

## Build

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all
```

## Testing

```bash
npm test
```

---

For more information, see the [main README](../README.md)


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