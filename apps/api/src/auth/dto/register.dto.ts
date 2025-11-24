import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsBoolean, Matches } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsBoolean()
  ageVerified: boolean; // Must be true (18+ confirmation)

  @IsBoolean()
  tosAccepted: boolean; // Must be true (Terms of Service acceptance)

  @IsBoolean()
  privacyAccepted: boolean; // Must be true (Privacy Policy acceptance)
}

