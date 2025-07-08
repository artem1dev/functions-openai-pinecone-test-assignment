import { writeFileSync, existsSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import pdf from 'pdf-parse';
import { Readable } from 'stream';

const s3 = new S3Client({ region: process.env.AWS_REGION });

interface PdfParseResult {
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
  version: string;
}

export const handler = async (event) => {
  const { fileId, s3Key } = event;
  const bucket = process.env.S3_BUCKET!;

  const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
  const buffer = await streamToBuffer(Body as Readable);

  const filename = s3Key.split('/').pop();
  const tmpPath = join(tmpdir(), filename!);

  writeFileSync(tmpPath, buffer);
  console.log('► existsSync:', existsSync(tmpPath));
  if (existsSync(tmpPath)) {
    console.log('► stat:', statSync(tmpPath));
  }
  const data = (await pdf(buffer)) as PdfParseResult;
  return { fileId, text: data.text };
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (let chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
