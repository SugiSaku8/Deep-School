// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PostsService } from './posts/posts.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const postsService = app.get(PostsService);
  await postsService.scanAndMaskProfanity(); // スキャンを実行

  await app.listen(8080);
  console.log(`Deep-Schoolerサーバーがポート8080で起動しました`);
}
bootstrap();