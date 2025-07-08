export const handler = async (event: { fileId: string; text: string }) => {
  const { fileId, text } = event;

  const chunkSize = 1000;
  const chunks: Array<{ fileId: string; chunkIndex: number; text: string }> = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push({
      fileId,
      chunkIndex: i / chunkSize,
      text: text.slice(i, i + chunkSize),
    });
  }

  return { fileId, chunks };
};
