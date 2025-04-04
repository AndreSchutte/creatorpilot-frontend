import './App.css';
import { useState } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('youtube');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
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

  return (
    <div className="container">
      <h1>YouTube Chapter Generator</h1>

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
        {loading ? 'Generating...' : 'Generate Chapters'}
      </button>

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
