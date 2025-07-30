import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/files/presign', { email });
      console.log('PRESIGN:', data);
      const { fileId: id, uploadUrl, key } = data;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      await api.post('/files/trigger', { fileId: id, key });

      localStorage.setItem('fileId', id);
      setFileId(id);
      setStatus('pending');
    } catch (err: any) {
      console.error(err);
      setError('Upload file error');
    }
    setIsLoading(false);
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
    setIsDeleting(true);
    if (!fileId) return;
    try {
      await api.delete(`/files/${fileId}`);
      localStorage.removeItem('fileId');
      setFileId(undefined);
      setFile(null);
      setStatus(undefined);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      setError('Delete file error');
    }
    setIsDeleting(false);
  };

  return (
    <div className="app-container">
      <div className="top-right-buttons">
        <button className="danger" onClick={() => {
          localStorage.clear();
          router.push('/');
        }}>
          Log out
        </button>
      </div>
      <div className="card">
        <h1>Upload your PDF</h1>
        <label className={`custom-file-upload file-label ${fileId || isLoading ? 'uploaded' : ''}`}>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={onSelect} disabled={!!fileId || isLoading} />
          📄 Choose file
        </label>
        {file && <span
          style={{
            color: '#dbeafe',
            padding: '0 0 0 5px',
            display: 'inline-block',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
          }}
          title={file.name}
        >
          {file.name}
        </span>}
        <button onClick={upload} disabled={!file || !!fileId || isLoading} style={{ display: 'inline-flex', justifyContent: "center" }}>
          {isLoading ? (
            <>
              <span style={{ padding: "0 5px 0 0" }}>Uploading...</span>
              <LoadingSpinner small />
            </>
          ) : (
            'Upload'
          )}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {status && <p>Status: <strong>{status}</strong></p>}

        {status === 'success' && <>
          <button className="secondary" onClick={() => router.push('/chat')}>
            Go to chat
          </button>
          <br /><br />
        </>}
        {fileId && (
          <button className="danger" onClick={removeFile} disabled={isDeleting} style={{ display: 'inline-flex', justifyContent: "center" }}>
            {isDeleting ? (
              <>
                <span style={{ padding: "0 5px 0 0" }}>Deleting...</span>
                <LoadingSpinner small />
              </>
            ) : (
              'Delete file'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
