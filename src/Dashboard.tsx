// src/Dashboard.tsx
import { useEffect, useState } from 'react';

function Dashboard() {
  const [token, setToken] = useState('');
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState('markdown');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setTranscript(text);
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      alert('Please provide a transcript.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/generate-chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript, format }),
      });

      const data = await response.json();

      if (response.ok) {
        setChapters(data.chapters);
      } else {
        alert(`❌ ${data.error || 'Generation failed'}`);
      }
    } catch (err) {
      alert('❌ Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container">
        <p style={{ color: '#f00' }}>❌ No token found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Welcome to your Dashboard</h2>
      <p style={{ color: 'limegreen' }}>✅ You are logged in. Token loaded.</p>
      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h3>Paste or Upload Transcript</h3>
      <textarea
        rows={10}
        style={{ width: '100%' }}
        placeholder="Type or paste your transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <input
        type="file"
        accept=".txt,.srt"
        onChange={handleFileUpload}
        style={{ marginTop: '1rem' }}
      />

      <div style={{ marginTop: '1rem' }}>
        <label>Format: </label>
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="markdown">Markdown</option>
          <option value="plain">Plain Text</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        style={{ marginTop: '1rem' }}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Chapters'}
      </button>

      {chapters && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Generated Chapters</h3>
          <pre>{chapters}</pre>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
