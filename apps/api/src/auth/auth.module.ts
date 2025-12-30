import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";
import { PrismaModule } from "../common/prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { RateLimitModule } from "../common/rate-limit/rate-limit.module";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    RateLimitModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiConfig = require("@novafans/config").getApiConfig();
        return {
          secret: apiConfig.jwtAccessSecret,
          signOptions: {
            expiresIn: apiConfig.jwtAccessExpiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

