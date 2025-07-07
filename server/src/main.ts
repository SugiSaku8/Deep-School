// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PostsService } from './posts/posts.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with production and development origins
  const allowedOrigins = [
    // Development origins
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Production origins
    'https://deep-school.onrender.com',
    'https://*.onrender.com',
    "https://sugisaku8.github.io"
    // Add any other domains you need
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const postsService = app.get(PostsService);
  await postsService.scanAndMaskProfanity(); // スキャンを実行

  await app.listen(process.env.PORT || 8080);
  console.log(`Deep-Schoolerサーバーがポート${process.env.PORT || 8080}で起動しました`);
}
bootstrap();