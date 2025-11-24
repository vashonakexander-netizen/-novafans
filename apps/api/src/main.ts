import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as helmet from "helmet";
import { AppModule } from "./app.module";
import { getApiConfig } from "@novafans/config";

async function bootstrap() {
  const config = getApiConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security: Helmet middleware
  app.use(helmet.default({
    contentSecurityPolicy: config.nodeEnv === "production",
    crossOriginEmbedderPolicy: false, // Allow embedding for media
  }));

  // Serve static files from uploads directory
  const uploadsPath = join(process.cwd(), config.uploadsDir);
  app.useStaticAssets(uploadsPath, {
    prefix: "/uploads/",
  });

  // CORS - Hardened settings
  app.enableCors({
    origin: config.frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.listen(config.port, "0.0.0.0");
  console.log(`API server running on ${config.baseUrl} (${config.nodeEnv})`);
}

bootstrap();

