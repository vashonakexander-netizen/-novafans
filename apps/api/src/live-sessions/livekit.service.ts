import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AccessToken, RoomServiceClient, Room } from "livekit-server-sdk";

function getEnvOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

interface LiveKitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

@Injectable()
export class LiveKitService implements OnModuleInit {
  private readonly logger = new Logger(LiveKitService.name);
  private config: LiveKitConfig | null = null;
  private roomClient: RoomServiceClient | null = null;

  onModuleInit() {
    const url = getEnvOptional("LIVEKIT_URL");
    const apiKey = getEnvOptional("LIVEKIT_API_KEY");
    const apiSecret = getEnvOptional("LIVEKIT_API_SECRET");

    if (url && apiKey && apiSecret) {
      this.config = { url, apiKey, apiSecret };
      this.roomClient = new RoomServiceClient(url, apiKey, apiSecret);
      this.logger.log("LiveKit service initialized");
    } else {
      this.logger.warn("LiveKit not configured (missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET). Using fake mode.");
    }
  }

  isConfigured(): boolean {
    return this.config !== null && this.roomClient !== null;
  }

  async createRoom(roomName: string, options?: { maxParticipants?: number }): Promise<Room> {
    if (!this.roomClient) {
      throw new Error("LiveKit not configured");
    }

    try {
      const room = await this.roomClient.createRoom({
        name: roomName,
        maxParticipants: options?.maxParticipants || 100,
        emptyTimeout: 300, // 5 minutes
        departureTimeout: 20, // 20 seconds
      });

      this.logger.log(`Created LiveKit room: ${roomName}`);
      return room;
    } catch (error: any) {
      this.logger.error(`Failed to create LiveKit room: ${error.message}`);
      throw error;
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    if (!this.roomClient) {
      throw new Error("LiveKit not configured");
    }

    try {
      await this.roomClient.deleteRoom(roomName);
      this.logger.log(`Deleted LiveKit room: ${roomName}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete LiveKit room: ${error.message}`);
      throw error;
    }
  }

  async generatePublisherToken(roomName: string, participantIdentity: string, participantName?: string): Promise<string> {
    if (!this.config) {
      throw new Error("LiveKit not configured");
    }

    const token = new AccessToken(this.config.apiKey, this.config.apiSecret, {
      identity: participantIdentity,
      name: participantName || participantIdentity,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: false,
      canPublishData: true,
    });

    return await token.toJwt();
  }

  async generateSubscriberToken(roomName: string, participantIdentity: string, participantName?: string): Promise<string> {
    if (!this.config) {
      throw new Error("LiveKit not configured");
    }

    const token = new AccessToken(this.config.apiKey, this.config.apiSecret, {
      identity: participantIdentity,
      name: participantName || participantIdentity,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });

    return await token.toJwt();
  }

  getStreamUrl(roomName: string): string {
    if (!this.config) {
      throw new Error("LiveKit not configured");
    }

    // Return WebRTC URL for LiveKit
    return `${this.config.url}/room/${roomName}`;
  }
}

