import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('youtube');
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentTranscripts');
    if (stored) {
      setRecent(JSON.parse(stored));
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);

    const updatedRecent = [transcript, ...recent.filter((r) => r !== transcript)].slice(0, 3);
    localStorage.setItem('recentTranscripts', JSON.stringify(updatedRecent));
    setRecent(updatedRecent);

    try {
      const response = await fetch('https://creatorpilot-backend.onrender.com/api/generate-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, format }),
      });

      const data = await response.json();
      setChapters(data.chapters || 'No chapters returned');
    } catch (err) {
      setChapters('❌ Something went wrong!');
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(chapters);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadTranscript = (text: string) => {
    setTranscript(text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <img
        src="/logo.png"
        alt="CreatorPilot Logo"
        style={{
          width: '160px',
          margin: '0 auto 2rem',
          display: 'block',
          filter: 'drop-shadow(0 0 6px #00ffffaa)',
        }}
      />

      <textarea
        rows={10}
        placeholder="Paste your transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        style={{
          marginTop: '1rem',
          padding: '0.5rem',
          backgroundColor: '#111',
          color: '#0ff',
          border: '1px solid #0ff',
          borderRadius: '5px',
        }}
      >
        <option value="youtube">YouTube Style</option>
        <option value="timestamps">Timestamps Only</option>
        <option value="markdown">Markdown Style</option>
      </select>

      <button
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <div className="spinner" />
        ) : (
          'Generate Chapters'
        )}
      </button>

      {recent.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: '#0ff' }}>Recent Transcripts:</h3>
          {recent.map((item, idx) => (
            <button
              key={idx}
              onClick={() => loadTranscript(item)}
              style={{
                display: 'block',
                margin: '0.5rem 0',
                padding: '0.5rem',
                backgroundColor: '#1a1a1a',
                color: '#0ff',
                border: '1px solid #0ff',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {item.slice(0, 80)}...
            </button>
          ))}
        </div>
      )}

      {chapters && (
        <>
          <pre>{chapters}</pre>
          <button
            onClick={handleCopy}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: copied ? '#00cc99' : '#00ffff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s',
            }}
          >
            {copied ? 'Copied!' : 'Copy Chapters'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
