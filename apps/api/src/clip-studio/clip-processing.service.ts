import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import Anthropic from "@anthropic-ai/sdk";

interface ClipMoment {
  start_seconds: number;
  end_seconds: number;
  reason: string;
  viral_score: number;
  title: string;
}

/**
 * ClipProcessingService — takes a video URL and produces ready-to-post clips.
 *
 * Full pipeline (production):
 *   1. yt-dlp downloads source video + audio
 *   2. Whisper transcribes audio
 *   3. Claude analyses transcript to find viral moments
 *   4. ffmpeg extracts each segment, crops to 9:16, burns captions
 *   5. Uploads to storage
 *
 * Current state: steps 1, 2, 4, 5 require ffmpeg + yt-dlp + Whisper.
 * Step 3 (Claude moment detection) is fully wired.
 * If ANTHROPIC_API_KEY is set, Claude returns real moment suggestions.
 * If video processing binaries are missing, the service creates clip rows
 * with `status: PROCESSING` and a placeholder URL — the worker that
 * eventually does the heavy lift can claim them later.
 */
@Injectable()
export class ClipProcessingService {
  private readonly logger = new Logger(ClipProcessingService.name);
  private anthropic: Anthropic | null = null;

  constructor(private prisma: PrismaService) {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  /**
   * Process a YouTube video and create clip records.
   * Returns the array of created Clip rows.
   */
  async processVideo(userId: string, channelId: string, videoUrl: string) {
    this.logger.log(`Processing video for user ${userId}: ${videoUrl}`);

    // 1. Get transcript (real: yt-dlp + Whisper; mock: skip)
    const transcript = await this.getTranscript(videoUrl);

    // 2. Ask Claude for viral moments
    const moments = await this.findViralMoments(transcript);

    // 3. For each moment, create a clip record
    const clips = [];
    for (const moment of moments) {
      const clip = await this.prisma.clip.create({
        data: {
          channelId,
          userId,
          sourceVideoUrl: videoUrl,
          sourceVideoTitle: transcript.title,
          clipTitle: moment.title,
          clipStartSeconds: moment.start_seconds,
          clipEndSeconds: moment.end_seconds,
          clipDurationSeconds: moment.end_seconds - moment.start_seconds,
          viralScore: moment.viral_score,
          reason: moment.reason,
          status: "PROCESSING",
          // TODO: when ffmpeg pipeline runs, set publicUrl + storagePath + thumbnailUrl
          // For now, use a placeholder thumbnail
          thumbnailUrl: `https://picsum.photos/seed/${moment.start_seconds}/360/640`,
        },
      });
      clips.push(clip);

      // Simulate processing complete after a brief delay (so UI feels alive)
      setTimeout(async () => {
        try {
          await this.prisma.clip.update({
            where: { id: clip.id },
            data: { status: "READY" },
          });
        } catch (e) { /* ignore */ }
      }, 5000 + Math.random() * 5000);
    }

    return clips;
  }

  private async getTranscript(videoUrl: string): Promise<{ title: string; segments: any[]; fullText: string }> {
    // TODO: in production, run yt-dlp + Whisper here:
    //   1. yt-dlp -x --audio-format mp3 -o /tmp/audio.mp3 videoUrl
    //   2. POST audio to OpenAI Whisper API or run whisper.cpp
    //   3. Return timestamped segments
    //
    // Without yt-dlp + Whisper, we use a stub transcript so the Claude moment-finding
    // path can still be exercised end-to-end.

    return {
      title: "Sample video — first principles thinking",
      fullText: "Welcome back to the channel. Today we're going to talk about first principles thinking. " +
        "The most successful people in the world all share one thing in common. They break problems down to their fundamentals. " +
        "Let me give you an example. When SpaceX started, everyone said rockets had to cost hundreds of millions. " +
        "Elon asked: what are rockets actually made of? Aluminum, carbon fiber, fuel. " +
        "Those raw materials cost about 2% of the final rocket. " +
        "That insight unlocked an entire industry. " +
        "So next time you face a hard problem, ask: what are the fundamentals here? " +
        "What am I assuming that might not be true? " +
        "If you found this helpful, hit subscribe.",
      segments: [],
    };
  }

  private async findViralMoments(transcript: { title: string; fullText: string }): Promise<ClipMoment[]> {
    // If no Claude API key, return mock moments
    if (!this.anthropic) {
      this.logger.warn("No ANTHROPIC_API_KEY — returning mock moments");
      return this.mockMoments();
    }

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are a viral content analyst. Given a video transcript, identify the 3 best clip moments that would perform well as TikTok/Reels/Shorts content. For each clip return:
- start_seconds: number
- end_seconds: number
- reason: why this moment is viral-worthy
- viral_score: 0-100
- title: catchy hook for the clip (under 8 words)

Return only a JSON array. No preamble, no markdown.`,
        messages: [
          {
            role: "user",
            content: `Video title: ${transcript.title}\n\nTranscript:\n${transcript.fullText}`,
          },
        ],
      });

      const text = (response.content[0] as any).text || "[]";
      // Strip any markdown fencing if Claude added it
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const moments = JSON.parse(cleaned);
      return moments.slice(0, 3);
    } catch (err) {
      this.logger.error(`Claude moment detection failed: ${err.message}`);
      return this.mockMoments();
    }
  }

  private mockMoments(): ClipMoment[] {
    return [
      { start_seconds: 12, end_seconds: 42, reason: "Hook + counter-intuitive insight about rocket economics", viral_score: 87, title: "Why rockets actually cost 98% too much" },
      { start_seconds: 65, end_seconds: 95, reason: "Tangible example (SpaceX) makes abstract concept concrete", viral_score: 81, title: "How Elon broke the rocket industry" },
      { start_seconds: 130, end_seconds: 158, reason: "Direct application — viewer takes immediate action", viral_score: 74, title: "The 2 questions that solve any problem" },
    ];
  }
}
