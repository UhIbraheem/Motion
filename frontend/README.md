# Motion Mobile App

React Native mobile app for Motion.

## Tech Stack

- React Native + Expo
- TypeScript
- NativeWind (Tailwind for RN)
- Supabase Auth
- React Navigation

## Setup

```bash
npm install
cp .env.example .env  # Add your config
npx expo start
```

## Environment Variables

Required in `.env`:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Run

```bash
npx expo start
```

Scan QR code with Expo Go app to test on device.

See `.claude/project.md` for full development guide.
