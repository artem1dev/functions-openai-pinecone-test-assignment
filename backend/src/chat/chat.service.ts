import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../files/files.entity';
import { OpenAIService } from '../openai/openai.service';
import { PineconeService } from '../pinecone/pinecone.service';
import OpenAI from 'openai';

type ChatMsg = Parameters<OpenAI['chat']['completions']['create']>[0]['messages'][number];

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    private readonly openai: OpenAIService,
    private readonly pinecone: PineconeService,
  ) {}

  async ask(fileId: string, question: string): Promise<string> {
    const file = await this.fileRepo.findOneBy({ id: fileId });
    if (!file) throw new NotFoundException(`File ${fileId} not found`);
    if (file.status !== 'success') throw new BadRequestException('File not ready');

    const qEmb = await this.openai.embed(question);
    const matches = await this.pinecone.query(qEmb, fileId, 15);
    const context = matches.map(m => (m.metadata as any).text).join('\n\n');

    const messages: ChatMsg[] = [
      { role: 'system', content: `You are a helpful assistant that answers based solely on the provided context.\n\nContext:\n${context}` },
      { role: 'user', content: question },
    ];
    return this.openai.chat(messages);
  }
}