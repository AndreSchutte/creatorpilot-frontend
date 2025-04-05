import { useEffect, useState } from 'react';

type TranscriptRecord = {
  _id: string;
  text: string;
  result: string;
  format: string;
  createdAt: string;
};

function TranscriptHistoryPage({ apiUrl, token }: any) {
  const [history, setHistory] = useState<TranscriptRecord[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setHistory(data);
        } else {
          alert('❌ Failed to fetch history');
        }
      } catch {
        alert('❌ Network error fetching history');
      }
    };

    fetchHistory();
  }, [apiUrl, token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) return;

    try {
      const res = await fetch(`${apiUrl}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory(history.filter((item) => item._id !== id));
      } else {
        alert('❌ Failed to delete transcript');
      }
    } catch {
      alert('❌ Network error deleting transcript');
    }
  };

  const filtered = history.filter(
    (item) =>
      item.format.toLowerCase().includes(search.toLowerCase()) ||
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.result.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div>
      <h2>🕓 Transcript History</h2>

      <input
        type="text"
        placeholder="🔍 Search history..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{
          padding: '0.5rem',
          width: '100%',
          marginBottom: '1rem',
          background: '#111',
          color: '#0ff',
          border: '1px solid #0ff',
          borderRadius: '4px',
        }}
      />

      {paginated.map((item) => (
        <div key={item._id} style={{ background: '#1a1a1a', marginBottom: '1rem', padding: '1rem', borderRadius: '6px' }}>
          <p><strong>Format:</strong> {item.format}</p>
          <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</p>
          <p><strong>Transcript:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{item.text}</pre>
          <p><strong>Chapters:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{item.result}</pre>
          <button onClick={() => handleDelete(item._id)} style={{ marginTop: '0.5rem' }}>
            🗑 Delete
          </button>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          ◀ Prev
        </button>
        <span style={{ margin: '0 1rem' }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next ▶
        </button>
      </div>
    </div>
  );
}

export default TranscriptHistoryPage;
