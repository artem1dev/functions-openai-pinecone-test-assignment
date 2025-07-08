import axios from 'axios';

export const handler = async (event: {
  fileId: string;
  errorInfo: { Error: string; Cause: string };
}) => {
  console.log('UpdateStatusError invoked with', event);
  const { fileId, errorInfo } = event;
  const backend = process.env.API_BASE_URL!;
  await axios.post(`${backend}/files/${fileId}/error`, {
    error: errorInfo.Cause,
  });
  return { fileId };
};
