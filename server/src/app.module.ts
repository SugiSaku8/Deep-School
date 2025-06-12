import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module';
import { AppController } from './app.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/deep-school'),
    PostsModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
