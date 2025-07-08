import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { FileEntity } from '../files/files.entity';
import { OpenAIService } from '../openai/openai.service';
import { PineconeService } from '../pinecone/pinecone.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  providers: [ChatService, OpenAIService, PineconeService],
  controllers: [ChatController],
})
export class ChatModule {}