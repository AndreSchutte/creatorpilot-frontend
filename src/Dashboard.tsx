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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 5;
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileMessage, setProfileMessage] = useState('');


  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);

      const fetchProfile = async () => {
        try {
          const res = await fetch(`${apiUrl}/api/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (res.ok) {
            setName(data.name || '');
            setBio(data.bio || '');
          }
        } catch (err) {
          console.error('❌ Failed to load profile', err);
        }
      };
      fetchProfile();
      
  
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
      if (savedTheme) {
        setTheme(savedTheme);
        document.body.className = savedTheme;
      }
  
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

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage('✅ Profile updated successfully');
      } else {
        setProfileMessage(`❌ ${data.message}`);
      }
    } catch {
      setProfileMessage('❌ Failed to update profile');
    }
  };
  

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
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
        handleFetchHistory();
      } else {
        alert(`Error: ${data.error || 'Failed to generate chapters.'}`);
      }
    } catch {
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
        setPage(1);
      } else {
        alert('❌ Failed to fetch history');
      }
    } catch {
      alert('❌ Network error fetching history');
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to toggle this user's admin status?")) return;
  
    try {
      const res = await fetch(`${apiUrl}/api/admin/toggle-admin/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('✅ User role updated');
        handleFetchUsers(); // refresh the list
      } else {
        alert(`❌ ${data.message || 'Failed to update user'}`);
      }
    } catch {
      alert('❌ Network error while toggling admin');
    }
  };
  

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) return;

    try {
      const res = await fetch(`${apiUrl}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory(history.filter((item) => item._id !== id));
      } else {
        alert('❌ Failed to delete transcript');
      }
    } catch {
      alert('❌ Network error deleting transcript');
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.format.toLowerCase().includes(search.toLowerCase()) ||
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      item.result.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filteredHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  return (
    <div className="container">
      <h2>Welcome to your Dashboard</h2>

      {token ? (
        <>
          <p style={{ color: '#0f0' }}>✅ You are logged in.</p>
          <button onClick={handleLogout}>Logout</button>

          <button onClick={handleThemeToggle}>
            🌓 Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>

          <hr />


          {isAdmin && (
            <>
              <h3>👑 Admin Tools</h3>
              <button onClick={handleFetchUsers}>📄 View All Users</button>
              {users.length > 0 && (
                <table style={{ marginTop: '1rem', width: '100%', background: '#111', color: '#0ff' }}>
                  <thead>
                  <tr><th>Email</th><th>User ID</th><th>Role</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx}>
                    <td>{user.email}</td>
                    <td>{user._id}</td>
                    <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                    <td>
                        <button
                        onClick={() => handleToggleAdmin(user._id)}
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                        {user.isAdmin ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                </td>
            </tr>
        ))}

                  </tbody>
                </table>
              )}
              <hr />
            </>
          )}
          
          <h3>👤 Your Profile</h3>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <textarea
            placeholder="Your Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <button onClick={handleSaveProfile}>💾 Save Profile</button>
          {profileMessage && (
            <p style={{ marginTop: '0.5rem', color: 'lime' }}>{profileMessage}</p>
          )}
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

              <input
                type="text"
                placeholder="🔍 Search history..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem',
                  width: '100%',
                  marginBottom: '1rem',
                  background: '#111',
                  color: '#0ff',
                  border: '1px solid #0ff',
                  borderRadius: '4px',
                }}
              />

              {paginated.map((item) => (
                <div key={item._id} style={{ background: '#1a1a1a', marginBottom: '1rem', padding: '1rem', borderRadius: '6px' }}>
                  <p><strong>Format:</strong> {item.format}</p>
                  <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                  <p><strong>Transcript:</strong></p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{item.text}</pre>
                  <p><strong>Chapters:</strong></p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{item.result}</pre>
                  <button onClick={() => handleDelete(item._id)} style={{ marginTop: '0.5rem' }}>
                    🗑 Delete
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ◀ Prev
                </button>
                <span style={{ margin: '0 1rem' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next ▶
                </button>
              </div>
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
