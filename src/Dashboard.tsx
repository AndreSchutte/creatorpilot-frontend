import { useEffect, useState } from 'react';

function Dashboard() {
  const [token, setToken] = useState('');
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState('Markdown');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['text/plain'];
    const maxSize = 1 * 1024 * 1024; // 1MB

    if (!allowedTypes.includes(file.type)) {
      alert('❌ Unsupported file type. Please upload a .txt file.');
      return;
    }

    if (file.size > maxSize) {
      alert('❌ File too large. Max size is 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTranscript(event.target.result as string);
      } else {
        alert('❌ Failed to read file.');
      }
    };
    reader.onerror = () => {
      alert('❌ Error reading file.');
    };
    reader.readAsText(file);
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
      <h2>Welcome to your Dashboard</h2>

      {token ? (
        <>
          <p style={{ color: '#0f0' }}>✅ You are logged in. Token loaded.</p>
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
