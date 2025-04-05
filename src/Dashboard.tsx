// src/Dashboard.tsx
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  userId: string;
  isAdmin?: boolean;
};

type TranscriptRecord = {
  _id: string;
  text: string;
  result: string;
  format: string;
  createdAt: string;
};

function Dashboard() {
  const [token, setToken] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState('Markdown');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<TranscriptRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.isAdmin) setIsAdmin(true);
      } catch (err) {
        console.error('Token decode error:', err);
      }
    }
  }, []);

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
      alert('❌ Network error during generation');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUsers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else alert('❌ Failed to fetch users');
    } catch {
      alert('❌ Network error fetching users');
    }
  };

  const handleFetchHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data);
        setShowHistory(true);
      } else {
        alert('❌ Failed to fetch history');
      }
    } catch {
      alert('❌ Network error fetching history');
    }
  };

  return (
    <div className="container">
      <h2>Welcome to your Dashboard</h2>

      {token ? (
        <>
          <p style={{ color: '#0f0' }}>✅ You are logged in.</p>
          <button onClick={handleLogout}>Logout</button>
          <hr />

          {isAdmin && (
            <>
              <h3>👑 Admin Tools</h3>
              <button onClick={handleFetchUsers}>📄 View All Users</button>
              {users.length > 0 && (
                <table style={{ marginTop: '1rem', width: '100%', background: '#111', color: '#0ff' }}>
                  <thead>
                    <tr><th>Email</th><th>User ID</th><th>Role</th></tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.email}</td>
                        <td>{user._id}</td>
                        <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <hr />
            </>
          )}

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
          <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option>Markdown</option>
            <option>Plain Text</option>
          </select><br /><br />

          <button onClick={handleGenerate} disabled={loading}>
            {loading ? '⏳ Generating...' : 'Generate Chapters'}
          </button>

          <button onClick={handleFetchHistory} style={{ marginLeft: '1rem' }}>
            📚 View Transcript History
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
            </div>
          )}

          {showHistory && (
            <div style={{ marginTop: '3rem' }}>
              <h3>🕓 Transcript History</h3>
              {history.map((item, idx) => (
                <div key={idx} style={{ background: '#1a1a1a', marginBottom: '1rem', padding: '1rem', borderRadius: '6px' }}>
                  <p><strong>Format:</strong> {item.format}</p>
                  <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                  <p><strong>Transcript:</strong></p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{item.text}</pre>
                  <p><strong>Chapters:</strong></p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{item.result}</pre>
                </div>
              ))}
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
