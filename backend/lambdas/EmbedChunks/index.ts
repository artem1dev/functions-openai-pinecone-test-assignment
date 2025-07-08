import OpenAI from 'openai';

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

  return { fileId, vectors: embedded };
};
