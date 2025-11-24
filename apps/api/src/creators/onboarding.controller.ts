import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { CreatorsService } from "./creators.service";
import { OnboardingService } from "./onboarding.service";
import {
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStep5Dto,
} from "./dto/onboarding.dto";

@Controller("creators/onboarding")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CREATOR)
export class OnboardingController {
  constructor(
    private creatorsService: CreatorsService,
    private onboardingService: OnboardingService
  ) {}

  @Get("status")
  async getStatus(@CurrentUser() user: any) {
    return this.onboardingService.getStatus(user.id);
  }

  @Post("step-1")
  async step1(@CurrentUser() user: any, @Body() dto: OnboardingStep1Dto) {
    return this.onboardingService.completeStep1(user.id, dto);
  }

  @Post("step-2")
  async step2(@CurrentUser() user: any, @Body() dto: OnboardingStep2Dto) {
    return this.onboardingService.completeStep2(user.id, dto);
  }

  @Post("step-3")
  async step3(@CurrentUser() user: any, @Body() dto: OnboardingStep3Dto) {
    return this.onboardingService.completeStep3(user.id, dto);
  }

  @Post("step-4")
  async step4(@CurrentUser() user: any, @Body() dto: OnboardingStep4Dto) {
    return this.onboardingService.completeStep4(user.id, dto);
  }

  @Post("step-5")
  async step5(@CurrentUser() user: any, @Body() dto: OnboardingStep5Dto) {
    return this.onboardingService.completeStep5(user.id, dto);
  }

  @Post("complete")
  async complete(@CurrentUser() user: any) {
    return this.onboardingService.completeOnboarding(user.id);
  }
}

