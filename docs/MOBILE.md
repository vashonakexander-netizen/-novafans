# NovaFans Mobile App

React Native mobile application for NovaFans built with Expo.

## Features

### Fan Features
- Login/Register with 18+ verification
- Browse and discover creators
- Subscribe to creators (crypto payments)
- Direct messaging with AI autopilot
- Unlock paid DMs
- View live shows (LiveKit integration)
- Push notifications for new messages, subscribers, tips

### Creator Features
- View subscribers and analytics
- Message fans
- View earnings and balance
- Request payouts
- Manage profile

## Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd apps/mobile
pnpm install
```

### Environment Variables

Create `.env` file:

```env
API_BASE_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:3002
```

Or configure in `app.json` under `extra`.

### Development

```bash
# Start Expo dev server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── screens/        # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── CreatorProfileScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── LiveScreen.tsx
│   │   └── CreatorDashboardScreen.tsx
│   ├── components/     # Reusable components
│   ├── services/       # API clients
│   │   └── api.ts      # Main API client
│   ├── navigation/     # Navigation config
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── App.tsx             # Root component
├── app.json            # Expo configuration
└── package.json
```

## API Integration

The mobile app uses the same API as the web app:
- Base URL: `API_BASE_URL` from environment
- Authentication: JWT tokens stored in secure storage
- All endpoints match web app API

## Push Notifications

Uses Expo Push Notifications:
- Automatically registers token on app start
- Sends token to API `/notifications/register-token`
- Receives notifications for:
  - New messages
  - New subscribers (creators)
  - New tips (creators)
  - Live show notifications
  - Payment confirmations

## Live Streaming

Uses LiveKit React Native SDK:
- Connects to LiveKit server
- Receives viewer tokens from API
- Displays live streams in-app
- Supports tipping during live shows

## Security

- JWT tokens stored in `expo-secure-store`
- 18+ age verification on registration
- ToS and Privacy Policy acceptance required
- Secure API communication

## TODO

- [ ] Add secure token storage (expo-secure-store)
- [ ] Add image picker for media uploads
- [ ] Add payment flow UI
- [ ] Add deep linking
- [ ] Add biometric authentication
- [ ] Add offline support
- [ ] Add push notification handling
- [ ] Add LiveKit viewer integration

