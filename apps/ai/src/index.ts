import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { getAiConfig } from "@novafans/config";
import { generateReply } from "./llm-client";
import { buildSystemPrompt } from "./system-prompt";

const config = getAiConfig();
const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Allow larger payloads for conversation history

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "ok",
    provider: config.provider,
    model: config.provider !== "fake" ? config.model : undefined,
  });
});

// AI Reply endpoint
app.post("/ai/reply", async (req: Request, res: Response) => {
  try {
    const { conversationId, creatorId, fanId, lastMessages, aiPersonaSettings, creatorDisplayName } = req.body;

    if (!conversationId || !creatorId || !fanId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build system prompt from persona settings
    const displayName = creatorDisplayName || "the creator";
    const systemPrompt = buildSystemPrompt(aiPersonaSettings, displayName);

    // Build conversation messages from lastMessages
    // Limit to last 10-15 messages to avoid token blow-up
    const recentMessages = (lastMessages || []).slice(-15);
    const messages = recentMessages.map((msg: any) => {
      // Map sender types to roles
      let role: "user" | "assistant" | "system" = "user";
      if (msg.senderType === "FAN") {
        role = "user";
      } else if (msg.senderType === "CREATOR" || msg.senderType === "AI") {
        role = "assistant";
      }

      // Truncate very long messages (cap at 1000 chars)
      let content = msg.body || msg.content || "";
      if (content.length > 1000) {
        content = content.substring(0, 1000) + "...";
      }

      return {
        role,
        content,
      };
    });

    // Generate reply using LLM
    const reply = await generateReply({
      systemPrompt,
      messages,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });

    // Ensure reply is not empty
    const finalReply = reply.trim() || "Thanks for your message! I'll get back to you soon. ❤️";

    // Log the interaction (truncate to avoid huge payloads)
    const logPayload = {
      conversationId,
      creatorId,
      fanId,
      messageCount: lastMessages?.length || 0,
      provider: config.provider,
      model: config.provider !== "fake" ? config.model : undefined,
      timestamp: new Date().toISOString(),
      // Truncate request/response for logging (max 2-4 KB each)
      requestPayload: JSON.stringify({
        messageCount: messages.length,
        systemPromptLength: systemPrompt.length,
      }).substring(0, 2000),
      responsePayload: finalReply.substring(0, 2000),
    };

    res.json({
      reply: finalReply,
      logPayload,
    });
  } catch (error: any) {
    console.error("AI Reply error:", error.message || error);
    // Return a safe fallback response instead of breaking
    res.json({
      reply: "Sorry, I'm having trouble replying right now, but I'll get back to you soon. ❤️",
      logPayload: {
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Service running on ${config.baseUrl} (${config.nodeEnv})`);
  console.log(`AI Provider: ${config.provider}${config.provider !== "fake" ? ` (${config.model})` : " (fallback mode)"}`);
});
