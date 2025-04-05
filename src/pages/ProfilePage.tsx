import { useEffect, useState } from 'react';

function ProfilePage({ apiUrl, token }: any) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
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
  }, [apiUrl, token]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      if (res.ok) {
        setMessage('✅ Profile updated successfully');
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.message}`);
      }
    } catch {
      setMessage('❌ Failed to update profile');
    }
  };

  return (
    <div>
      <h2>👤 Your Profile</h2>
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
      <button onClick={handleSave}>💾 Save Profile</button>
      {message && <p style={{ marginTop: '0.5rem', color: 'lime' }}>{message}</p>}
    </div>
  );
}

export default ProfilePage;
