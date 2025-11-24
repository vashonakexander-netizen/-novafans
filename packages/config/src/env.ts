/**
 * Shared environment configuration utilities
 * Provides type-safe access to environment variables with validation
 */

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

export interface ApiConfig {
  port: number;
  baseUrl: string;
  nodeEnv: string;
  databaseUrl: string;
  redisUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  frontendOrigin: string;
  aiServiceUrl: string;
  storageBaseUrl: string;
  uploadsDir: string;
}

export interface WebConfig {
  port: number;
  baseUrl: string;
  nodeEnv: string;
  apiUrl: string;
  aiServiceUrl: string;
}

export interface AiConfig {
  port: number;
  baseUrl: string;
  nodeEnv: string;
  provider: "openai" | "anthropic" | "fake";
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface StorageConfig {
  provider: "local" | "s3" | "bunny";
  baseUrl: string;
  uploadsDir: string;
  // S3 config
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  // BunnyCDN config
  bunnyStorageZone?: string;
  bunnyAccessKey?: string;
  bunnyCdnUrl?: string;
}

export interface CryptoConfig {
  provider: "fake" | "nowpayments" | "coinpayments";
  apiKey?: string;
  ipnSecret?: string; // Webhook/notification secret or HMAC key (alias for webhookSecret)
  webhookSecret?: string; // Legacy alias, prefer ipnSecret
  callbackBaseUrl: string;
  defaultCurrency: string;
  minAmount: number;
}

export function getApiConfig(): ApiConfig {
  const nodeEnv = getEnvOptional("NODE_ENV", "development");
  const port = parseInt(getEnvOptional("PORT", "3001") || "3001", 10);

  return {
    port,
    baseUrl: getEnvOptional("API_BASE_URL", `http://localhost:${port}`) || `http://localhost:${port}`,
    nodeEnv: nodeEnv || "development",
    databaseUrl: getEnv("POSTGRES_URL") || getEnv("DATABASE_URL", ""),
    redisUrl: getEnvOptional("REDIS_URL", "redis://localhost:6379") || "redis://localhost:6379",
    jwtAccessSecret: getEnv("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),
    jwtAccessExpiresIn: getEnvOptional("JWT_ACCESS_EXPIRES_IN", "15m") || "15m",
    jwtRefreshExpiresIn: getEnvOptional("JWT_REFRESH_EXPIRES_IN", "7d") || "7d",
    frontendOrigin: getEnvOptional("FRONTEND_ORIGIN", "http://localhost:3000") || "http://localhost:3000",
    aiServiceUrl: getEnvOptional("AI_SERVICE_URL", "http://localhost:3002") || "http://localhost:3002",
    storageBaseUrl: getEnvOptional("STORAGE_BASE_URL", `http://localhost:${port}`) || `http://localhost:${port}`,
    uploadsDir: getEnvOptional("UPLOADS_DIR", "./uploads") || "./uploads",
  };
}

export function getWebConfig(): WebConfig {
  const nodeEnv = getEnvOptional("NODE_ENV", "development");
  const port = parseInt(getEnvOptional("PORT", "3000") || "3000", 10);

  return {
    port,
    baseUrl: getEnvOptional("WEB_BASE_URL", `http://localhost:${port}`) || `http://localhost:${port}`,
    nodeEnv: nodeEnv || "development",
    apiUrl: getEnv("NEXT_PUBLIC_API_URL") || getEnvOptional("API_BASE_URL", "http://localhost:3001") || "http://localhost:3001",
    aiServiceUrl: getEnvOptional("NEXT_PUBLIC_AI_SERVICE_URL", "http://localhost:3002") || "http://localhost:3002",
  };
}

export function getAiConfig(): AiConfig {
  const nodeEnv = getEnvOptional("NODE_ENV", "development");
  const port = parseInt(getEnvOptional("PORT", "3002") || "3002", 10);
  const provider = (getEnvOptional("AI_PROVIDER", "fake") || "fake") as "openai" | "anthropic" | "fake";
  const apiKey = getEnvOptional("AI_API_KEY");
  const model = getEnvOptional("AI_MODEL", "gpt-4o-mini") || "gpt-4o-mini";
  const maxTokens = parseInt(getEnvOptional("AI_MAX_TOKENS", "512") || "512", 10);
  const temperature = parseFloat(getEnvOptional("AI_TEMPERATURE", "0.7") || "0.7");

  return {
    port,
    baseUrl: getEnvOptional("AI_SERVICE_URL", `http://localhost:${port}`) || `http://localhost:${port}`,
    nodeEnv: nodeEnv || "development",
    provider,
    apiKey,
    model,
    maxTokens,
    temperature,
  };
}

export function getStorageConfig(): StorageConfig {
  const apiConfig = getApiConfig();
  const provider = (getEnvOptional("STORAGE_PROVIDER", "local") || "local") as "local" | "s3" | "bunny";
  
  return {
    provider,
    baseUrl: apiConfig.storageBaseUrl,
    uploadsDir: apiConfig.uploadsDir,
    // S3 config
    s3Bucket: getEnvOptional("S3_BUCKET"),
    s3Region: getEnvOptional("S3_REGION"),
    s3AccessKeyId: getEnvOptional("AWS_ACCESS_KEY_ID") || getEnvOptional("S3_ACCESS_KEY_ID"),
    s3SecretAccessKey: getEnvOptional("AWS_SECRET_ACCESS_KEY") || getEnvOptional("S3_SECRET_ACCESS_KEY"),
    // BunnyCDN config
    bunnyStorageZone: getEnvOptional("BUNNY_STORAGE_ZONE"),
    bunnyAccessKey: getEnvOptional("BUNNY_ACCESS_KEY"),
    bunnyCdnUrl: getEnvOptional("BUNNY_CDN_URL"),
  };
}

export function getCryptoConfig(): CryptoConfig {
  const apiConfig = getApiConfig();
  const provider = (getEnvOptional("CRYPTO_PROVIDER", "fake") || "fake") as "fake" | "nowpayments" | "coinpayments";
  const apiKey = getEnvOptional("CRYPTO_API_KEY");
  
  // IPN secret takes precedence, fallback to webhookSecret for backward compatibility
  const ipnSecret = getEnvOptional("CRYPTO_IPN_SECRET") || getEnvOptional("CRYPTO_WEBHOOK_SECRET");
  
  const callbackBaseUrl = getEnvOptional("CRYPTO_CALLBACK_BASE_URL", apiConfig.baseUrl) || apiConfig.baseUrl;
  const defaultCurrency = getEnvOptional("CRYPTO_DEFAULT_CURRENCY", "USDT") || "USDT";
  const minAmount = parseFloat(getEnvOptional("CRYPTO_MIN_AMOUNT", "1.0") || "1.0");

  return {
    provider,
    apiKey,
    ipnSecret,
    webhookSecret: ipnSecret, // Legacy alias
    callbackBaseUrl,
    defaultCurrency,
    minAmount,
  };
}

