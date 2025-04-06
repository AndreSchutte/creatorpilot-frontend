// src/pages/GenerateTitlesPage.tsx
import { useState } from 'react';

type Props = {
  token: string;
  apiUrl: string;
};

function GenerateTitlesPage({ token, apiUrl }: Props) {
  const [transcript, setTranscript] = useState('');
  const [titles, setTitles] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!transcript) return alert('Please enter a transcript first.');
    setLoading(true);
    setError('');
    setTitles('');

    try {
      const res = await fetch(`${apiUrl}/api/generate-titles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();
      if (res.ok && data.titles) {
        setTitles(data.titles);
      } else {
        setError(data.error || 'Failed to generate titles.');
      }
    } catch {
      setError('❌ Network error while generating titles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎯 Generate YouTube Titles</h2>
      <textarea
        placeholder="Paste your transcript here..."
        rows={10}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        style={{ width: '100%', padding: '1rem' }}
      />
      <br />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? '⏳ Generating...' : 'Generate Titles'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {titles && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Suggested Titles</h3>
          <pre style={{ background: '#111', padding: '1rem', borderRadius: '6px' }}>
            {titles}
          </pre>
          <button onClick={() => navigator.clipboard.writeText(titles)}>
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default GenerateTitlesPage;
