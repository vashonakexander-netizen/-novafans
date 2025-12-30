import { Telegraf, Context } from "telegraf";
import axios from "axios";
import "dotenv/config";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:3000";

if (!TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Helper to get user from API
async function getUserByTelegramChatId(chatId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/telegram/${chatId}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

// Helper to authenticate user
async function authenticateUser(chatId: string, userId: string) {
  try {
    await axios.post(`${API_BASE_URL}/users/telegram/link`, {
      telegramChatId: chatId,
      userId,
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Start command
bot.start(async (ctx: Context) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;

  const user = await getUserByTelegramChatId(chatId);

  if (user) {
    ctx.reply(
      `Welcome back, ${user.displayName}!\n\n` +
      `Use /summary for daily stats\n` +
      `Use /help for all commands`
    );
  } else {
    const loginUrl = `${WEB_BASE_URL}/telegram/login?chatId=${chatId}`;
    ctx.reply(
      `Welcome to NovaFans Creator Bot!\n\n` +
      `To get started, please log in:\n${loginUrl}\n\n` +
      `After logging in, you'll be able to receive notifications and manage your creator account.`
    );
  }
});

// Daily summary command
bot.command("summary", async (ctx: Context) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;

  const user = await getUserByTelegramChatId(chatId);
  if (!user || user.role !== "CREATOR") {
    ctx.reply("You must be a creator to use this command. Please log in first.");
    return;
  }

  try {
    // Get analytics
    const analyticsRes = await axios.get(`${API_BASE_URL}/creators/me/analytics`, {
      headers: { Authorization: `Bearer ${user.token}` }, // TODO: Store token securely
    });

    const analytics = analyticsRes.data;
    const balanceRes = await axios.get(`${API_BASE_URL}/payouts/me`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const balance = balanceRes.data.balance;

    const summary = `
📊 Daily Summary

💰 Earnings:
   Total: $${Number(analytics.totalEarnings || 0).toFixed(2)}
   This Month: $${Number(analytics.monthlyEarnings || 0).toFixed(2)}

👥 Subscribers:
   Active: ${analytics.activeSubscribersCount || 0}
   New (30d): ${analytics.newSubscribersLast30d || 0}

💵 Balance:
   Available: $${Number(balance?.available || 0).toFixed(2)}
   Pending: $${Number(balance?.pending || 0).toFixed(2)}
    `;

    ctx.reply(summary);
  } catch (error) {
    ctx.reply("Failed to fetch summary. Please try again later.");
  }
});

// AI mode toggle
bot.command("ai_on", async (ctx: Context) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;

  const user = await getUserByTelegramChatId(chatId);
  if (!user || user.role !== "CREATOR") {
    ctx.reply("You must be a creator to use this command.");
    return;
  }

  try {
    await axios.patch(
      `${API_BASE_URL}/creators/me`,
      { aiPersonaEnabled: true },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    ctx.reply("✅ AI autopilot enabled");
  } catch (error) {
    ctx.reply("Failed to enable AI autopilot");
  }
});

bot.command("ai_off", async (ctx: Context) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;

  const user = await getUserByTelegramChatId(chatId);
  if (!user || user.role !== "CREATOR") {
    ctx.reply("You must be a creator to use this command.");
    return;
  }

  try {
    await axios.patch(
      `${API_BASE_URL}/creators/me`,
      { aiPersonaEnabled: false },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    ctx.reply("❌ AI autopilot disabled");
  } catch (error) {
    ctx.reply("Failed to disable AI autopilot");
  }
});

// Help command
bot.command("help", (ctx: Context) => {
  ctx.reply(
    `🤖 NovaFans Creator Bot Commands:\n\n` +
    `/start - Start the bot\n` +
    `/summary - Get daily earnings and stats\n` +
    `/ai_on - Enable AI autopilot\n` +
    `/ai_off - Disable AI autopilot\n` +
    `/help - Show this help message\n\n` +
    `You'll also receive notifications for:\n` +
    `• New subscribers\n` +
    `• New tips\n` +
    `• New messages\n` +
    `• Payout status updates`
  );
});

// Handle photo/video uploads for content
bot.on("photo", async (ctx: Context) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;

  const user = await getUserByTelegramChatId(chatId);
  if (!user || user.role !== "CREATOR") {
    ctx.reply("Only creators can upload content via Telegram.");
    return;
  }

  const photo = ctx.message.photo?.[ctx.message.photo.length - 1];
  if (!photo) return;

  try {
    const file = await ctx.telegram.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // Download and upload to API
    const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(fileResponse.data);

    // Upload to API
    const formData = new FormData();
    formData.append("file", buffer, { filename: `telegram_${Date.now()}.jpg` });
    formData.append("context", "TELEGRAM");

    await axios.post(`${API_BASE_URL}/media/upload`, formData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    ctx.reply("✅ Content uploaded successfully!");
  } catch (error) {
    ctx.reply("Failed to upload content. Please try again.");
  }
});

bot.on("video", async (ctx: Context) => {
  const chatId = ctx.chat?.id.toString();
  if (!chatId) return;

  const user = await getUserByTelegramChatId(chatId);
  if (!user || user.role !== "CREATOR") {
    ctx.reply("Only creators can upload content via Telegram.");
    return;
  }

  const video = ctx.message.video;
  if (!video) return;

  try {
    const file = await ctx.telegram.getFile(video.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // Download and upload to API
    const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(fileResponse.data);

    const formData = new FormData();
    formData.append("file", buffer, { filename: `telegram_${Date.now()}.mp4` });
    formData.append("context", "TELEGRAM");

    await axios.post(`${API_BASE_URL}/media/upload`, formData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    ctx.reply("✅ Video uploaded successfully!");
  } catch (error) {
    ctx.reply("Failed to upload video. Please try again.");
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Start bot
bot.launch().then(() => {
  console.log("Telegram bot started");
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


