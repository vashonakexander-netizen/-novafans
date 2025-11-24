import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AgeVerificationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Authentication required");
    }

    // Check if user has verified age and accepted ToS/Privacy
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        ageVerified: true,
        tosAccepted: true,
        privacyAccepted: true,
      },
    });

    if (!dbUser) {
      throw new ForbiddenException("User not found");
    }

    if (!dbUser.ageVerified) {
      throw new ForbiddenException("Age verification required. You must be 18+ to use this platform.");
    }

    if (!dbUser.tosAccepted || !dbUser.privacyAccepted) {
      throw new ForbiddenException("Terms of Service and Privacy Policy acceptance required");
    }

    return true;
  }
}

