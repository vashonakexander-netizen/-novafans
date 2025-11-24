import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service";
import { Reflector } from "@nestjs/core";

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (context: ExecutionContext) => string;
}

export const RATE_LIMIT_KEY = "rate_limit";
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private rateLimitService: RateLimitService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const options = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, handler);

    if (!options) {
      return true; // No rate limit configured
    }

    const keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
    const key = keyGenerator(context);

    const result = await this.rateLimitService.checkRateLimit(key, {
      maxRequests: options.maxRequests,
      windowMs: options.windowMs,
    });

    if (!result.allowed) {
      throw new HttpException(
        {
          message: "Too many requests",
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader("X-RateLimit-Limit", options.maxRequests);
    response.setHeader("X-RateLimit-Remaining", result.remaining);
    response.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

    return true;
  }

  private defaultKeyGenerator(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip || request.connection?.remoteAddress || "unknown";

    // Use user ID if authenticated, otherwise use IP
    return user?.id ? `user:${user.id}` : `ip:${ip}`;
  }
}

