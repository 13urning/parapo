import { FareCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const trimLower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(trim)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  @Transform(trimLower)
  email!: string;

  // bcrypt only uses the first 72 bytes
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsEnum(FareCategory)
  fareCategory!: FareCategory;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  @Transform(trimLower)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
}
