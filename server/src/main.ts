// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PostsService } from './posts/posts.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with production and development origins
  const allowedOrigins = [
    // Production origins
    'https://deep-school.onrender.com',
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