import './App.css';
import { useState, useEffect } from 'react';

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
        // ✅ Remove alert for smoother experience
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

  // ✅ Optional redirect effect if needed for page navigation
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  if (token) {
    return (
      <div className="container">
        <h2>Welcome to your Dashboard</h2>
        <p style={{ color: 'limegreen' }}>✅ You are logged in. Token loaded.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

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

export default App;
