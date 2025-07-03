import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module';
import { AppController } from './app.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://sugisakug:<db_password>@open-lckschool.vxig2ua.mongodb.net/?retryWrites=true&w=majority&appName=Open-LCKSchool'),
    PostsModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
