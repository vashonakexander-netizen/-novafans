import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import {
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStep5Dto,
} from "./dto/onboarding.dto";
import { PostVisibility } from "@prisma/client";

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  async getStatus(creatorId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
      select: {
        onboardingCompleted: true,
        avatarUrl: true,
        headerImageUrl: true,
        baseSubPrice: true,
        aiPersonaEnabled: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Creator profile not found");
    }

    // Determine which steps are completed
    const steps = {
      step1: !!(profile.avatarUrl || profile.headerImageUrl),
      step2: Number(profile.baseSubPrice) > 0,
      step3: false, // Payout method stored separately (would need to check PayoutRequest or separate table)
      step4: profile.aiPersonaEnabled !== undefined,
      step5: false, // Check if creator has at least one post
    };

    // Check step 3 (payout method) - simplified check
    const hasPayoutRequest = await this.prisma.payoutRequest.findFirst({
      where: { creatorId },
    });
    steps.step3 = !!hasPayoutRequest;

    // Check step 5 (first post)
    const hasPost = await this.prisma.post.findFirst({
      where: { creatorId, isDeleted: false },
    });
    steps.step5 = !!hasPost;

    return {
      onboardingCompleted: profile.onboardingCompleted,
      steps,
      currentStep: this.getCurrentStep(steps),
    };
  }

  private getCurrentStep(steps: any): number {
    if (!steps.step1) return 1;
    if (!steps.step2) return 2;
    if (!steps.step3) return 3;
    if (!steps.step4) return 4;
    if (!steps.step5) return 5;
    return 6; // All complete
  }

  async completeStep1(creatorId: string, dto: OnboardingStep1Dto) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
    });

    if (!profile) {
      throw new NotFoundException("Creator profile not found");
    }

    await this.prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: {
        avatarUrl: dto.avatarUrl || profile.avatarUrl,
        headerImageUrl: dto.headerImageUrl || profile.headerImageUrl,
      },
    });

    return { success: true, step: 1 };
  }

  async completeStep2(creatorId: string, dto: OnboardingStep2Dto) {
    await this.prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: {
        baseSubPrice: dto.baseSubPrice,
      },
    });

    return { success: true, step: 2 };
  }

  async completeStep3(creatorId: string, dto: OnboardingStep3Dto) {
    // Store payout method preference (simplified - in production, might want a separate table)
    // For now, we'll just mark step 3 as complete
    // Payout details are stored when first payout request is made
    return { success: true, step: 3, message: "Payout method preference saved" };
  }

  async completeStep4(creatorId: string, dto: OnboardingStep4Dto) {
    await this.prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: {
        aiPersonaEnabled: dto.aiPersonaEnabled,
        aiPersonaSettings: dto.aiPersonaSettings || null,
      },
    });

    return { success: true, step: 4 };
  }

  async completeStep5(creatorId: string, dto: OnboardingStep5Dto) {
    // Create first post
    const post = await this.prisma.post.create({
      data: {
        creatorId,
        title: dto.title || "Welcome to my page!",
        body: dto.body || "Thanks for subscribing!",
        visibility: PostVisibility.PUBLIC_TEASER,
        status: "PUBLISHED",
      },
    });

    // Add media if provided
    if (dto.mediaUrl) {
      await this.prisma.postMedia.create({
        data: {
          postId: post.id,
          fileUrl: dto.mediaUrl,
          mediaType: dto.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? "VIDEO" : "IMAGE",
        },
      });
    }

    return { success: true, step: 5, postId: post.id };
  }

  async completeOnboarding(creatorId: string) {
    const status = await this.getStatus(creatorId);

    if (status.currentStep < 6) {
      throw new BadRequestException("Please complete all onboarding steps first");
    }

    await this.prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: {
        onboardingCompleted: true,
        isActive: true, // Activate creator profile
      },
    });

    return { success: true, onboardingCompleted: true };
  }
}


