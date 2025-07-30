import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Pinecone } from '@pinecone-database/pinecone'
import { Readable } from 'stream'

const s3 = new S3Client({ region: process.env.AWS_REGION! })
const pine = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })

const BUCKET = process.env.S3_BUCKET_NAME!
const INDEX_NAME = process.env.PINECONE_INDEX!

export const handler = async (event: { fileId: string }) => {
  const fileId = event.fileId
  const key = `vectors/${fileId}.json`

  const s3Object = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const stream = s3Object.Body as Readable
  const json = await streamToString(stream)
  const vectors = JSON.parse(json)

  const index = pine.index(INDEX_NAME)

  await index.upsert(
    vectors.map((v: any) => ({
      id: v.id,
      values: v.values,
      metadata: v.metadata,
    }))
  )

  return { fileId, indexed: vectors.length }
}

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}
