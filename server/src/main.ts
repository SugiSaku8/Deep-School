// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PostsService } from './posts/posts.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORSを有効化
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const postsService = app.get(PostsService);
  await postsService.scanAndMaskProfanity(); // スキャンを実行

  await app.listen(8080);
  console.log(`Deep-Schoolerサーバーがポート8080で起動しました`);
}
bootstrap();