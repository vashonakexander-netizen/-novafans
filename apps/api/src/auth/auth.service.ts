import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma/prisma.service";
import { RegisterDto, LoginDto } from "./dto";
import { UserRole } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // Check if username exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException("Username already exists");
    }

    // Validate password (already validated by DTO, but double-check)
    if (dto.password.length < 8) {
      throw new ConflictException("Password must be at least 8 characters");
    }

    // Validate age verification and ToS acceptance
    if (!dto.ageVerified) {
      throw new ConflictException("You must be 18+ to use this platform");
    }

    if (!dto.tosAccepted || !dto.privacyAccepted) {
      throw new ConflictException("You must accept Terms of Service and Privacy Policy");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        displayName: dto.displayName || dto.username,
        passwordHash,
        role: dto.role || UserRole.FAN,
        ageVerified: true, // Set to true since we validated it
        tosAccepted: true,
        tosAcceptedAt: now,
        privacyAccepted: true,
        privacyAcceptedAt: now,
      },
    });

    // If creator, create profile
    if (user.role === UserRole.CREATOR) {
      await this.prisma.creatorProfile.create({
        data: {
          userId: user.id,
          isActive: false,
        },
      });

      // Create initial balance
      await this.prisma.creatorBalance.create({
        data: {
          creatorId: user.id,
          balanceAvailable: 0,
          balancePending: 0,
        },
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned");
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        country: true,
        dob: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
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
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}

