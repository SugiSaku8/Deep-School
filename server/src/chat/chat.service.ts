import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async processMessage(message: string, conversationHistory: any[]): Promise<string> {
    // TODO: Implement actual chat processing logic here
    // For now, return a simple echo response
    return `Echo: ${message}`;
  }
} 