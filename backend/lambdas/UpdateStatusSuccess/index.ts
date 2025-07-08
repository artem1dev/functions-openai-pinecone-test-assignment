import axios from 'axios';

export const handler = async (event: { fileId: string }) => {
  const { fileId } = event;
  const backend = process.env.API_BASE_URL!;
  await axios.post(`${backend}/files/${fileId}/success`);
  return { fileId };
};
