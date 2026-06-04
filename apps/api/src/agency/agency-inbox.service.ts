import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import Anthropic from "@anthropic-ai/sdk";

@Injectable()
export class AgencyInboxService {
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async getInbox(clientId: string) {
    return this.prisma.agencyMessage.findMany({
      where: { clientId, direction: "INBOUND" },
      include: { aiDrafts: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  }

  async generateDraft(messageId: string) {
    const message = await this.prisma.agencyMessage.findUnique({
      where: { id: messageId },
      include: {
        client: true,
        aiDrafts: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!message) throw new Error("Message not found");

    // Get last 10 messages from this fan for context
    const history = await this.prisma.agencyMessage.findMany({
      where: { clientId: message.clientId, fanName: message.fanName },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const toneProfile = message.client.toneProfile || "Be friendly, engaging, and authentic.";
    const creatorName = message.client.name;

    const systemPrompt = `You are responding as ${creatorName}, a content creator.
Tone and personality: ${toneProfile}

Guidelines:
- Stay in character as ${creatorName}
- Be warm, personal, and engaging
- Keep responses concise (2-4 sentences typically)
- Never reveal you are an AI
- If unsure about specific personal details, be vague but warm
- Return ONLY the message response text, nothing else`;

    const contextMessages = history.slice(-10).map((m) => ({
      role: m.direction === "INBOUND" ? "user" as const : "assistant" as const,
      content: m.content,
    }));

    // Add current message if not already last
    if (!contextMessages.length || contextMessages[contextMessages.length - 1].content !== message.content) {
      contextMessages.push({ role: "user", content: message.content });
    }

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: contextMessages,
    });

    const draftContent = (response.content[0] as any).text || "";

    // Calculate confidence score based on response characteristics
    const confidence = this.calculateConfidence(message.content, draftContent, toneProfile);

    return this.prisma.agencyAiDraft.create({
      data: { messageId, draftContent, confidenceScore: confidence },
    });
  }

  private calculateConfidence(input: string, draft: string, toneProfile: string): number {
    let score = 0.75;
    // Penalize if draft is too short or too long
    if (draft.length < 20) score -= 0.2;
    if (draft.length > 500) score -= 0.1;
    // Penalize if draft contains suspicious phrases
    const redFlags = ["as an ai", "i cannot", "i'm unable", "i don't have", "i apologize"];
    if (redFlags.some((flag) => draft.toLowerCase().includes(flag))) score -= 0.3;
    // Reward if draft is appropriately sized
    if (draft.length > 50 && draft.length < 300) score += 0.1;
    return Math.max(0.1, Math.min(1.0, score));
  }

  async approveDraft(draftId: string, content: string) {
    const draft = await this.prisma.agencyAiDraft.update({
      where: { id: draftId },
      data: { approved: true, editedContent: content },
    });
    // Mark message as replied
    await this.prisma.agencyMessage.update({ where: { id: draft.messageId }, data: { status: "REPLIED" } });
    // Create outbound message record
    const inbound = await this.prisma.agencyMessage.findUnique({ where: { id: draft.messageId } });
    if (inbound) {
      await this.prisma.agencyMessage.create({
        data: {
          clientId: inbound.clientId,
          platform: inbound.platform,
          fanName: inbound.fanName,
          content,
          direction: "OUTBOUND",
          status: "READ",
        },
      });
    }
    return draft;
  }

  async rejectDraft(draftId: string) {
    return this.prisma.agencyAiDraft.update({ where: { id: draftId }, data: { rejected: true } });
  }

  async getTemplates(agencyId: string) {
    return this.prisma.agencyResponseTemplate.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" } });
  }

  async createTemplate(agencyId: string, dto: { title: string; content: string }) {
    return this.prisma.agencyResponseTemplate.create({ data: { agencyId, title: dto.title, content: dto.content, tags: [] } });
  }
}
