import './App.css';
import { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // ✅ Load API URL from .env and log it
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('🌐 VITE_API_URL:', apiUrl);

  const handleAuth = async () => {
    if (!apiUrl) {
      alert('❌ API base URL is not set.');
      return;
    }

    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
      const response = await fetch(`${apiUrl}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        alert('✅ Auth successful!');
      } else {
        alert(`❌ ${data.message || 'Authentication failed'}`);
      }
    } catch (err) {
      alert('❌ Network error');
      console.error('❌ Fetch error:', err);
    }
  };

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

      {token && <p style={{ color: '#0f0' }}>JWT Token saved!</p>}
    </div>
  );
}

export default App;
