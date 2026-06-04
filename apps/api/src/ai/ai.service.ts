import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";
const axios = require("axios");

@Injectable()
export class AiService implements OnModuleInit {
  private aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {
    const { aiServiceUrl } = require("@savage-house/config").getApiConfig();
    this.aiServiceUrl = aiServiceUrl;
  }

  async onModuleInit() {
    // Start worker to process AI reply jobs
    this.startAiReplyWorker();
  }

  private async startAiReplyWorker() {
    console.log("AI Reply Worker started");

    setInterval(async () => {
      try {
        const jobData = await this.redis.brpop("ai_reply_jobs", 5);
        if (jobData) {
          const [, jobJson] = jobData;
          const job = JSON.parse(jobJson);
          await this.processAiReplyJob(job);
        }
      } catch (error) {
        console.error("AI Reply Worker error:", error);
      }
    }, 2000); // Check every 2 seconds
  }

  private async processAiReplyJob(job: {
    conversationId: string;
    creatorId: string;
    fanId: string;
    messageId: string;
  }) {
    try {
      // Get conversation and messages
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: job.conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 20, // Last 20 messages
          },
          creator: {
            include: {
              creatorProfile: true,
            },
          },
        },
      });

      if (!conversation) {
        return;
      }

      // Get creator profile settings
      const aiPersonaSettings = conversation.creator.creatorProfile?.aiPersonaSettings || {};
      const creatorDisplayName = conversation.creator.displayName || conversation.creator.username || "the creator";

      // Call AI service
      const response = await axios.post(`${this.aiServiceUrl}/ai/reply`, {
        conversationId: job.conversationId,
        creatorId: job.creatorId,
        fanId: job.fanId,
        lastMessages: conversation.messages
          .reverse()
          .map((m) => ({
            senderType: m.senderType,
            body: m.body,
            createdAt: m.createdAt,
          })),
        aiPersonaSettings,
        creatorDisplayName,
      });

      const aiReply = response.data.reply;
      const logPayload = response.data.logPayload || {};

      // Create AI session if needed
      let aiSession = await this.prisma.aiSession.findFirst({
        where: { conversationId: job.conversationId },
        orderBy: { createdAt: "desc" },
      });

      if (!aiSession) {
        const aiConfig = require("@savage-house/config").getAiConfig();
        aiSession = await this.prisma.aiSession.create({
          data: {
            conversationId: job.conversationId,
            creatorId: job.creatorId,
            fanId: job.fanId,
            aiModel: logPayload.model || aiConfig.model || "fallback",
            temperature: aiConfig.temperature || 0.7,
            systemPrompt: "AI autopilot enabled",
          },
        });
      }

      // Log AI interaction (truncate payloads to avoid huge DB entries)
      await this.prisma.aiLog.create({
        data: {
          aiSessionId: aiSession.id,
          requestPayload: logPayload.requestPayload || {},
          responsePayload: logPayload.responsePayload || { reply: aiReply },
        },
      });

      // Create AI message
      const message = await this.prisma.message.create({
        data: {
          conversationId: job.conversationId,
          senderType: "AI",
          senderId: null,
          body: aiReply,
        },
      });

      // Update conversation
      await this.prisma.conversation.update({
        where: { id: job.conversationId },
        data: {
          lastMessageId: message.id,
          updatedAt: new Date(),
        },
      });

      console.log(`AI reply sent for conversation ${job.conversationId}`);
    } catch (error) {
      console.error("Error processing AI reply job:", error);
    }
  }

  async generateReply(conversationId: string, creatorId: string, fanId: string): Promise<string> {
    // This is a placeholder - in production, call the AI service
    return "Thank you for your message! I'll get back to you soon.";
  }
}

