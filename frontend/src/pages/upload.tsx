import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

export default function UploadPage() {
  const router = useRouter();
  const email =
    typeof window !== 'undefined'
      ? localStorage.getItem('email') || ''
      : '';

  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>();
  const [error, setError] = useState<string>('');

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf' && f.size <= 10_000_000) {
      setFile(f);
      setError('');
    } else {
      setError('Only PDF under 10 MB');
    }
  };

  const upload = async () => {
    setError('');
    try {
      const { data } = await api.post('/files/presign', { email });
      console.log('PRESIGN:', data);
      const { fileId: id, uploadUrl } = data;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      localStorage.setItem('fileId', id);
      setFileId(id);
      setStatus('pending');
    } catch (err: any) {
      console.error(err);
      setError('Upload file error');
    }
  };

  useEffect(() => {
    if (!fileId) return;
    const iv = setInterval(async () => {
      try {
        const { data } = await api.get(`/files/${fileId}/status`);
        setStatus(data.status);
        if (data.status !== 'pending') clearInterval(iv);
      } catch (err) {
        console.error(err);
        clearInterval(iv);
      }
    }, Number(process.env.NEXT_PUBLIC_POLL_INTERVAL) || 2000);
    return () => clearInterval(iv);
  }, [fileId]);

  const removeFile = async () => {
    if (!fileId) return;
    try {
      await api.delete(`/files/${fileId}`);
      localStorage.removeItem('fileId');
      setFileId(undefined);
      setFile(null);
      setStatus(undefined);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Delete file error');
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Upload your PDF</h1>
        <label className="custom-file-upload file-label">
          <input type="file" accept=".pdf" onChange={onSelect} disabled={!!fileId} />
          📄 Choose file
        </label>
        <button onClick={upload} disabled={!file || !!fileId}>Upload</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {status && <p>Status: <strong>{status}</strong></p>}

        {status === 'success' && (
          <button className="secondary" onClick={() => router.push('/chat')}>
            Go to chat
          </button>
        )}
        {fileId && (
          <button className="danger" onClick={removeFile}>
            Delete file
          </button>
        )}
      </div>
    </div>
  );
}
