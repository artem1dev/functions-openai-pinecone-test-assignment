import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'

const pine = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })

export const handler = async (event: {
  fileId: string
  vectors: Array<{
    id: string
    values: number[]
    metadata: Record<string, any>
  }>
}) => {
  const index = pine.index(process.env.PINECONE_INDEX!)

  const upsertRecords: PineconeRecord<Record<string, any>>[] = event.vectors.map(v => ({
    id: v.id,
    values: v.values,
    metadata: {
      ...v.metadata,
      fileId: event.fileId
    }
  }))

  await index.upsert(upsertRecords)

  return { fileId: event.fileId }
}
