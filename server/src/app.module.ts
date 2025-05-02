import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/deep-school'),
    PostsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
