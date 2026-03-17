import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  MONGO_URI!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsNumberString()
  BCRYPT_SALT_ROUNDS?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return config;
}
