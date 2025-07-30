import OpenAI from 'openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
const s3 = new S3Client({ region: process.env.AWS_REGION! })

const BUCKET = process.env.S3_BUCKET_NAME!

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handler = async (event: {
  fileId: string;
  chunks: Array<{ fileId: string; chunkIndex: number; text: string }>;
}) => {
  const { fileId, chunks } = event;

  const embedded = [];
  for (const { chunkIndex, text } of chunks) {
    const res = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    embedded.push({
      id: `${fileId}-${chunkIndex}`,
      values: res.data[0].embedding,
      metadata: { text, fileId, chunkIndex },
    });
  }
  const key = `vectors/${fileId}.json`
  const body = JSON.stringify(embedded)

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: 'application/json',
  }))

  return { fileId, s3Key: key }
};
