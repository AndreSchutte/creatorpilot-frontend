// src/Dashboard.tsx
import { useEffect, useState } from 'react';

function Dashboard() {
  const [token, setToken] = useState('');
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState('Markdown');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);

    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    setTheme(storedTheme || 'dark');
    document.documentElement.setAttribute('data-theme', storedTheme || 'dark');
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target?.result as string);
      };
      reader.readAsText(uploaded);
    }
  };

  const handleGenerate = async () => {
    if (!transcript) return alert('Please paste or upload a transcript.');
    setLoading(true);
    setSuccessMessage('');

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
      if (response.ok && data.chapters) {
        setChapters(data.chapters);
        setTranscript('');
        setSuccessMessage('✅ Chapters generated successfully!');
      } else {
        alert(`Error: ${data.error || 'Failed to generate chapters.'}`);
      }
    } catch (err) {
      console.error('❌ Generation error', err);
      alert('❌ Network error during generation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Welcome to your Dashboard</h2>
        <button onClick={handleThemeToggle}>
          {theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {token ? (
        <>
          <p style={{ color: 'var(--accent-color)' }}>✅ You are logged in. Token loaded.</p>
          <button onClick={handleLogout}>Logout</button>
          <hr />

          <h3>Paste or Upload Transcript</h3>
          <textarea
            placeholder="Type or paste your transcript here..."
            rows={10}
            cols={60}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          /><br />

          <input type="file" accept=".txt" onChange={handleFileChange} /><br /><br />

          <label htmlFor="format">Format:</label>{' '}
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option>Markdown</option>
            <option>Plain Text</option>
          </select><br /><br />

          <button onClick={handleGenerate} disabled={loading}>
            {loading ? '⏳ Generating...' : 'Generate Chapters'}
          </button>

          {successMessage && (
            <p style={{ color: 'limegreen', marginTop: '1rem' }}>{successMessage}</p>
          )}

          {chapters && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Generated Chapters</h3>
              <pre style={{ background: '#111', padding: '1rem', borderRadius: '5px' }}>
                {chapters}
              </pre>

              <button onClick={() => navigator.clipboard.writeText(chapters)}>
                📋 Copy to Clipboard
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([chapters], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'chapters.txt';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                style={{ marginLeft: '1rem' }}
              >
                ⬇ Download as .txt
              </button>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: '#f00' }}>❌ No token found.</p>
      )}
    </div>
  );
}

export default Dashboard;
