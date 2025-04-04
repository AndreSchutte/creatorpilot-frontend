import './App.css';
import { useState } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('youtube');

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
        <pre>
          {chapters}
        </pre>
      )}
    </div>
  );
}

export default App;
