import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleMessage(
    @Body() body: { message: string; conversationHistory: any[] },
  ) {
    const response = await this.chatService.processMessage(
      body.message,
      body.conversationHistory,
    );
    return { response };
  }
} 