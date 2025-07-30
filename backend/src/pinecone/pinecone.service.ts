import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
  ScoredPineconeRecord,
} from '@pinecone-database/pinecone';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PineconeService implements OnModuleInit {
  private client: Pinecone;

  constructor(private readonly config: ConfigService) { }

  onModuleInit() {
    this.client = new Pinecone({
      apiKey: this.config.get<string>('PINECONE_API_KEY'),
    });
  }

  async upsert(
    indexName: string,
    vectors: PineconeRecord<RecordMetadata>[]
  ): Promise<void> {
    const index = this.client.Index(indexName);
    await index.upsert(vectors);
  }

  async query(
    vector: number[],
    myFileId: string,
    topK = 5
  ): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
    const res = await this.client.index(this.config.get<string>('PINECONE_INDEX')).query({
      vector,
      topK,
      includeMetadata: true,
      filter: {
        fileId: myFileId // 👈 фильтрация только по нужному файлу
      }
    });
    return res.matches;
  }

}