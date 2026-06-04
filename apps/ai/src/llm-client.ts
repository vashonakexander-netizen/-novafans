import { getAiConfig } from "@savage-house/config";
import OpenAI from "openai";

export interface GenerateReplyParams {
  systemPrompt: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generate a reply using the configured LLM provider
 * Falls back to rule-based responses if no provider is configured
 */
export async function generateReply(params: GenerateReplyParams): Promise<string> {
  const config = getAiConfig();
  const { systemPrompt, messages, maxTokens, temperature } = params;

  // If provider is "fake" or no API key, use fallback
  if (config.provider === "fake" || !config.apiKey) {
    console.warn("AI_PROVIDER is 'fake' or AI_API_KEY not set. Using fallback response.");
    return generateFallbackReply(messages);
  }

  // OpenAI provider
  if (config.provider === "openai" && config.apiKey) {
    try {
      const openai = new OpenAI({
        apiKey: config.apiKey,
      });

      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((msg) => ({
            role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: msg.content,
          })),
        ],
        max_tokens: maxTokens || config.maxTokens,
        temperature: temperature ?? config.temperature,
      });

      const reply = response.choices[0]?.message?.content?.trim() || "";
      if (!reply || reply.length < 10) {
        return generateFallbackReply(messages);
      }
      return reply;
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      // Fallback to safe response on error
      return generateFallbackReply(messages);
    }
  }

  // TODO: Add Anthropic support
  // if (config.provider === "anthropic" && config.apiKey) {
  //   // Use Anthropic SDK
  // }

  // Default fallback
  return generateFallbackReply(messages);
}

/**
 * Generate a simple rule-based fallback reply
 * This maintains backward compatibility when no LLM is configured
 */
function generateFallbackReply(messages: { role: string; content: string }[]): string {
  const lastUserMessage = messages
    .filter((m) => m.role === "user")
    .slice(-1)[0]?.content?.toLowerCase() || "";

  // Simple rule-based responses
  if (lastUserMessage.includes("hey") || lastUserMessage.includes("hi") || lastUserMessage.includes("hello")) {
    return "Hey! Thanks for reaching out. ❤️";
  }
  if (lastUserMessage.includes("how are you")) {
    return "I'm doing great, thanks for asking! How about you? 😊";
  }
  if (lastUserMessage.includes("miss") || lastUserMessage.includes("missed")) {
    return "Aww, I missed you too! ❤️";
  }
  if (lastUserMessage.includes("love") || lastUserMessage.includes("❤️")) {
    return "Thank you so much! That means a lot. ❤️";
  }
  if (lastUserMessage.includes("?")) {
    return "That's a great question! Let me think about that... 😊";
  }

  // Generic friendly response
  return "Thanks for your message! I'll get back to you soon. ❤️";
}


