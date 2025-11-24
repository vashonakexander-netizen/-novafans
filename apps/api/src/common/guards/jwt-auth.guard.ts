import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    // Verify token via parent guard
    const parentResult = await super.canActivate(context);
    if (!parentResult) {
      return false;
    }

    // Check if user is banned
    const user = request.user;
    if (user?.isBanned) {
      throw new UnauthorizedException("User is banned");
    }

    // Refresh user from DB to ensure latest ban status
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.isBanned) {
      throw new UnauthorizedException("User is banned");
    }

    request.user = dbUser;
    return true;
  }
}

