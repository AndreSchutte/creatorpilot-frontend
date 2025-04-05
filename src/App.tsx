import './App.css';
import { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import TranscriptHistoryPage from './pages/TranscriptHistoryPage';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleAuth = async () => {
    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
      const response = await fetch(`${apiUrl}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        alert(`❌ ${data.message || 'Authentication failed'}`);
      }
    } catch (err) {
      alert('❌ Network error');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  if (!token) {
    return (
      <div className="container">
        <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button onClick={handleAuth}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p style={{ marginTop: '1rem' }}>
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    );
  }

  return (

      <div className="container">
        <h2>Welcome to your Dashboard</h2>
        <p style={{ color: '#0f0' }}>✅ You are logged in.</p>
        <button onClick={handleLogout}>Logout</button>

        <nav style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
          <Link to="/">🏠 Home</Link>
          <Link to="/profile">👤 Profile</Link>
          <Link to="/admin">👑 Admin Tools</Link>
          <Link to="/history">📚 History</Link>
        </nav>

        <Routes>
          <Route path="/" element={<DashboardPage token={token} apiUrl={apiUrl} />} />
          <Route path="/profile" element={<ProfilePage token={token} apiUrl={apiUrl} />} />
          <Route path="/admin" element={<AdminPage token={token} apiUrl={apiUrl} />} />
          <Route path="/history" element={<TranscriptHistoryPage token={token} apiUrl={apiUrl} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
  );
}

export default App;
