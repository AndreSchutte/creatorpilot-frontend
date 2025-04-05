import { useEffect, useState } from 'react';

type Props = {
    apiUrl: string;
    token: string;
    isOwner: boolean;
    isAdmin: boolean; // ✅ This was missing
  };
  

function AdminPage({ apiUrl, token, isOwner, isAdmin }: Props) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
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

    fetchUsers();
  }, [apiUrl, token]);

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
        setUsers((prev) =>
          prev.map((u) =>
            u._id === data.user._id ? { ...u, isAdmin: data.user.isAdmin } : u
          )
        );
      } else {
        alert(`❌ ${data.message || 'Failed to update user'}`);
      }
    } catch {
      alert('❌ Network error while toggling admin');
    }
  };

  return (
    <div>
      <h2>👑 Admin Tools</h2>
      {users.length > 0 ? (
        <table style={{ marginTop: '1rem', width: '100%', background: '#111', color: '#0ff' }}>
          <thead>
            <tr><th>Email</th><th>User ID</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx}>
                <td>{user.email}</td>
                <td>{user._id}</td>
                <td>
                  {user.isOwner
                    ? 'Owner'
                    : user.isAdmin
                    ? 'Admin'
                    : 'User'}
                </td>
                <td>
                {(isOwner || isAdmin) && !user.isOwner ? (
                    <button
                      onClick={() => handleToggleAdmin(user._id)}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                      {user.isAdmin ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  ) : (
                    <span style={{ color: '#888' }}>
                      🔒 {user.isOwner ? 'Owner Locked' : 'Admin Locked'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading users...</p>
      )}
    </div>
  );
}

export default AdminPage;
