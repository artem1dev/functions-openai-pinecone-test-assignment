import { useState } from 'react';
import api from '../lib/api';

export default function ChatPage() {
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
    <div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={m.from}>{m.text}</div>
        ))}
      </div>
      <input
        disabled={!fileId}
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <button disabled={!q} onClick={send}>Send</button>
    </div>
  );
}
