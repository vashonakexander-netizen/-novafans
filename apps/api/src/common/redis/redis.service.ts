import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor() {
    const { redisUrl } = require("@savage-house/config").getApiConfig();
    this.client = new Redis(redisUrl);
  }

  async onModuleInit() {
    this.client.on("error", (err) => {
      console.error("Redis error:", err);
    });
    this.client.on("connect", () => {
      console.log("Redis connected");
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async lpush(list: string, ...values: string[]): Promise<number> {
    return this.client.lpush(list, ...values);
  }

  async rpop(list: string): Promise<string | null> {
    return this.client.rpop(list);
  }

  async brpop(list: string, timeout: number): Promise<[string, string] | null> {
    return this.client.brpop(list, timeout);
  }
}

