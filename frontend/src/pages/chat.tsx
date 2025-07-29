import { useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/router';

export default function ChatPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const fileId = typeof window !== 'undefined'
    ? localStorage.getItem('fileId')
    : '';

  const send = async () => {
    setMessages([...messages, { from: 'user', text: q }]);
    const { data } = await api.post('/chat', { fileId, question: q });
    setMessages(m => [...m, { from: 'bot', text: data.answer }]);
    setQ('');
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <div className="top-right-buttons">
        <button className="secondary" onClick={() => router.push('/upload')}>
          ← Back to upload
        </button>
      </div>
      <div className="message-container">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: 500 }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask your question..."
          disabled={!fileId}
        />
        <button onClick={send} disabled={!q}>Send</button>
      </div>
    </div>
  );
}
