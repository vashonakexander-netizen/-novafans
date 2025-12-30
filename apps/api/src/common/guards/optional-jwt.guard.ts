import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    // Try to activate, but don't throw if token is missing
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result.catch(() => {
        // If auth fails, continue without user (public access)
        return true;
      });
    }
    return result;
  }

  handleRequest(err: any, user: any, info: any) {
    // Don't throw error if no user
    return user || null;
  }
}


