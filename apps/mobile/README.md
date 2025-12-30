# NovaFans Mobile App

React Native mobile app for NovaFans built with Expo.

## Features

- **Fan Features:**
  - Login/Register with 18+ verification
  - Browse creators
  - Subscribe (crypto payments)
  - Direct messaging with AI autopilot
  - Unlock paid DMs
  - View live shows (LiveKit integration)
  - Push notifications

- **Creator Features:**
  - View subscribers
  - Message fans
  - See earnings & balance
  - Request payouts

## Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for Mac) or Android Emulator

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

Or set in `app.json` under `extra`.

### Run

```bash
# Start Expo dev server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── services/       # API clients
│   ├── navigation/     # Navigation config
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── App.tsx             # Root component
├── app.json            # Expo configuration
└── package.json
```

## API Integration

The app uses the same API as the web app:
- Base URL: `API_BASE_URL` from environment
- Authentication: JWT tokens stored in secure storage
- All endpoints match web app API

## Push Notifications

Uses Expo Push Notifications:
- Automatically registers token on app start
- Sends token to API `/notifications/register-token`
- Receives notifications for:
  - New messages
  - New subscribers
  - Live show notifications
  - Payment confirmations

## Live Streaming

Uses LiveKit React Native SDK:
- Connects to LiveKit server
- Receives viewer tokens from API
- Displays live streams in-app

## TODO

- [ ] Add secure token storage (expo-secure-store)
- [ ] Add image picker for media uploads
- [ ] Add payment flow UI
- [ ] Add deep linking
- [ ] Add biometric authentication
- [ ] Add offline support


