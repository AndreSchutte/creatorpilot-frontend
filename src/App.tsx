import './App.css';
import { useState } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://creatorpilot-backend.onrender.com/api/generate-chapters', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      setChapters(data.chapters || 'No chapters returned');
    } catch (err) {
      setChapters('❌ Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1>YouTube Chapter Generator</h1>
      <textarea
        rows={10}
        style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        placeholder="Paste your transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />
      <button
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Chapters'}
      </button>

      {chapters && (
        <pre style={{ marginTop: '2rem', backgroundColor: '#222', padding: '1rem' }}>
          {chapters}
        </pre>
      )}
    </div>
  );
}

export default App;
