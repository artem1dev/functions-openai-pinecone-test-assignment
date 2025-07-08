import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type ChatMsg = Parameters<OpenAI['chat']['completions']['create']>[0]['messages'][number];

@Injectable()
export class OpenAIService {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async embed(text: string): Promise<number[]> {
    const res = await this.client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return res.data[0].embedding;
  }

  async chat(messages: ChatMsg[]): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages,
    });
    return res.choices[0].message.content;
  }
}
