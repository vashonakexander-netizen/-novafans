# Telegram Creator Bot

The NovaFans Telegram bot allows creators to manage their account and receive notifications directly from Telegram.

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. Copy the bot token provided

### 2. Configure Environment Variables

Create or update `.env` in `apps/telegram-bot/`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
API_BASE_URL=http://localhost:3001
WEB_BASE_URL=http://localhost:3000
```

For production:

```env
TELEGRAM_BOT_TOKEN=your_production_bot_token
API_BASE_URL=https://api.novafans.com
WEB_BASE_URL=https://novafans.com
```

### 3. Build and Run

```bash
# Build the bot
pnpm --filter telegram-bot build

# Run in development (with auto-reload)
pnpm --filter telegram-bot dev

# Run in production
pnpm --filter telegram-bot start
```

## Bot Commands

### `/start`
Welcome message and quick help

### `/help`
List all available commands

### `/summary`
Get daily summary:
- New subscribers count
- Total earnings (available + pending)
- Unread messages count
- Active subscriptions count

### `/ai_on`
Enable AI autopilot for your creator account

### `/ai_off`
Disable AI autopilot for your creator account

### `/link <token>`
Link your creator account to Telegram using an authentication token from the web dashboard

## Notifications

The bot sends automatic notifications for:

- **New Subscriber**: When someone subscribes to your creator account
- **New Message**: When a fan sends you a message
- **Tip Received**: When someone tips you during a live session

## Account Linking

### Method 1: Token Link

1. Go to your creator dashboard on the web app
2. Navigate to Settings → Telegram
3. Generate a linking token
4. Send `/link <token>` to the bot in Telegram

### Method 2: Login Link (Coming Soon)

The bot will provide a secure login link that opens in your browser to authenticate.

## Development

### Project Structure

```
apps/telegram-bot/
├── src/
│   └── index.ts      # Main bot logic
├── package.json
├── tsconfig.json
└── .env.example
```

### Adding New Commands

1. Add command handler in `src/index.ts`:

```typescript
bot.command('mycommand', async (ctx) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;
  
  // Your command logic here
  ctx.reply('Command response');
});
```

2. Update `/help` command to include new command

### Security Notes

⚠️ **Production Considerations:**

- [ ] Implement rate limiting for commands
- [ ] Add user authentication/authorization checks
- [ ] Validate all API responses
- [ ] Add error handling for API failures
- [ ] Log all commands for audit
- [ ] Use secure token generation for account linking
- [ ] Implement token expiration

## API Endpoints Used

- `GET /users/telegram/:chatId` - Get user by Telegram chat ID
- `POST /users/telegram/link` - Link Telegram chat to user account
- `GET /creators/:id/summary` - Get creator daily summary
- `POST /creators/:id/ai-persona` - Toggle AI autopilot
- `GET /creators/:id/subscriptions` - Get subscriptions count
- `GET /messages/conversations/:id/unread` - Get unread messages count

## Troubleshooting

### Bot not responding

1. Check `TELEGRAM_BOT_TOKEN` is set correctly
2. Verify bot is running: Check process logs
3. Test token validity with Telegram API

### Commands not working

1. Ensure bot has permission to receive messages
2. Check user is linked to a creator account
3. Verify API_BASE_URL is correct and accessible

### Notifications not sending

1. Verify user's `telegramChatId` is set in database
2. Check notification service is calling Telegram API
3. Ensure bot has permission to send messages

## Support

For issues or questions:
1. Check logs: `pnpm --filter telegram-bot dev`
2. Verify environment variables
3. Test API endpoints directly
4. Check Telegram bot API status
