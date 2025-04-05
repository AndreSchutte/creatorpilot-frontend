// src/Dashboard.tsx
import { useEffect, useState } from 'react';

function Dashboard() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <div className="container">
      <h2>Welcome to your Dashboard</h2>
      {token ? (
        <p style={{ color: '#0f0' }}>✅ You are logged in. Token loaded.</p>
      ) : (
        <p style={{ color: '#f00' }}>❌ No token found.</p>
      )}
    </div>
  );
}

export default Dashboard;
