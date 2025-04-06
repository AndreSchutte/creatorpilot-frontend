import { useEffect, useState } from 'react';

type Props = {
  apiUrl: string;
  token: string;
};

type Transcript = {
  _id: string;
  text: string;
  format: string;
  result: string;
  tool: string;
  createdAt: string;
};

function TranscriptHistoryPage({ apiUrl, token }: Props) {
  const [history, setHistory] = useState<Transcript[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setHistory(data);
        else alert('❌ Failed to load history');
      } catch {
        alert('❌ Network error loading history');
      }
    };

    fetchHistory();
  }, [apiUrl, token]);

  const groupByTool = (data: Transcript[]) => {
    return data.reduce((groups: Record<string, Transcript[]>, item) => {
      const tool = item.tool || 'unknown';
      if (!groups[tool]) groups[tool] = [];
      groups[tool].push(item);
      return groups;
    }, {});
  };

  const grouped = groupByTool(history);

  return (
    <div>
      <h2>📚 Your History</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {Object.keys(grouped).map((tool) => (
          <div key={tool} style={{ flex: '1 1 300px' }}>
            <h3>{tool}</h3>
            <ul>
              {grouped[tool].map((item) => (
                <li key={item._id} style={{ marginBottom: '1rem' }}>
                  <strong>Created:</strong>{' '}
                  {new Date(item.createdAt).toLocaleString()}
                  <pre
                    style={{
                      background: '#111',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflowX: 'auto',
                      marginTop: '0.5rem',
                    }}
                  >
                    {item.result}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TranscriptHistoryPage;
