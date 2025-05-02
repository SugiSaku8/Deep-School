import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'サーバーは正常に起動しています';
  }
}