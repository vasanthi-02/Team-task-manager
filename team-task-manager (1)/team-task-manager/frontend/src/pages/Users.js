import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  const fetchUsers = () => {
    api.get('/api/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, role) => {
    await api.put(`/api/users/${id}/role`, { role });
    fetchUsers();
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{users.length} registered</span>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Change Role</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? 'var(--accent)' : 'var(--accent3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#000' }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.id !== user.id ? (
                      <select className="form-control" style={{ width: 'auto', padding: '5px 10px', fontSize: 13 }}
                        value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
