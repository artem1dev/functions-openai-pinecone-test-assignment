import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './chat.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequestDto) {
    const answer = await this.chatService.ask(body.fileId, body.question);
    return { answer };
  }
}