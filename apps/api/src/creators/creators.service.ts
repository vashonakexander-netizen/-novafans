import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CacheService } from "../common/cache/cache.service";
import { UpdateCreatorProfileDto } from "./dto";

@Injectable()
export class CreatorsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  async getPublicProfile(username: string) {
    // Try cache first
    const cacheKey = `creator:profile:${username}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        creatorProfile: true,
      },
    });

    if (!user || user.role !== "CREATOR") {
      throw new NotFoundException("Creator not found");
    }

    const { passwordHash, email, isBanned, ...publicData } = user;
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, publicData, 300);
    
    return publicData;
  }

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: {
          include: {
            user: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
        },
        creatorBalance: true,
      },
    });

    if (!user || user.role !== "CREATOR") {
      throw new ForbiddenException("Not a creator");
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateCreatorProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });

    if (!user || user.role !== "CREATOR") {
      throw new ForbiddenException("Not a creator");
    }

    // Update user fields
    const userUpdate: any = {};
    if (dto.displayName) userUpdate.displayName = dto.displayName;

    if (Object.keys(userUpdate).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdate,
      });
    }

    // Update or create creator profile
    const profileUpdate: any = {};
    if (dto.bio !== undefined) profileUpdate.bio = dto.bio;
    if (dto.avatarUrl !== undefined) profileUpdate.avatarUrl = dto.avatarUrl;
    if (dto.headerImageUrl !== undefined) profileUpdate.headerImageUrl = dto.headerImageUrl;
    if (dto.baseSubPrice !== undefined) profileUpdate.baseSubPrice = dto.baseSubPrice;
    if (dto.isActive !== undefined) profileUpdate.isActive = dto.isActive;
    if (dto.aiPersonaEnabled !== undefined) profileUpdate.aiPersonaEnabled = dto.aiPersonaEnabled;
    if (dto.aiPersonaSettings !== undefined) profileUpdate.aiPersonaSettings = dto.aiPersonaSettings;

    if (user.creatorProfile) {
      await this.prisma.creatorProfile.update({
        where: { userId },
        data: profileUpdate,
      });
    } else {
      await this.prisma.creatorProfile.create({
        data: {
          userId,
          ...profileUpdate,
        },
      });
    }

    return this.getMyProfile(userId);
  }
}

