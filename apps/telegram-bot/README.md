# NovaFans Telegram Creator Bot

Telegram bot for creators to manage their NovaFans account and receive notifications.

## Features

- **Daily Summary** - Get earnings, subscribers, and balance stats
- **AI Mode Toggle** - Enable/disable AI autopilot via commands
- **Content Upload** - Upload photos/videos directly from Telegram
- **Notifications** - Receive notifications for:
  - New subscribers
  - New tips
  - New messages
  - Payout status updates

## Setup

### Prerequisites

- Node.js 18+
- Telegram Bot Token (from @BotFather)

### Installation

```bash
cd apps/telegram-bot
pnpm install
```

### Environment Variables

Create `.env` file:

```env
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
API_BASE_URL=http://localhost:3001
WEB_BASE_URL=http://localhost:3000
```

### Run

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## Commands

- `/start` - Start the bot and get login link
- `/summary` - Get daily earnings and stats
- `/ai_on` - Enable AI autopilot
- `/ai_off` - Disable AI autopilot
- `/help` - Show help message

## Getting Bot Token

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow instructions to create bot
4. Copy the bot token
5. Add to `.env` as `TELEGRAM_BOT_TOKEN`

## API Integration

The bot requires API endpoints:
- `GET /users/telegram/:chatId` - Get user by Telegram chat ID
- `POST /users/telegram/link` - Link Telegram chat to user account
- `GET /creators/me/analytics` - Get creator analytics
- `GET /payouts/me` - Get creator balance
- `PATCH /creators/me` - Update creator profile
- `POST /media/upload` - Upload media

## TODO

- [ ] Secure token storage for API authentication
- [ ] Webhook support for production
- [ ] More commands (view messages, manage posts)
- [ ] Interactive keyboards for better UX


