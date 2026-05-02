import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks?projectId=${id}`)
      ]);
      setProject(projRes.data.project);
      setMembers(projRes.data.members);
      setTasks(tasksRes.data.tasks);
      setEditStatus(projRes.data.project.status);
      if (user?.role === 'admin') {
        const usersRes = await api.get('/api/users');
        setAllUsers(usersRes.data.users);
      }
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    await api.post(`/api/projects/${id}/members`, { userId: selectedUser });
    setShowAddMember(false); setSelectedUser('');
    fetchData();
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/api/projects/${id}/members/${userId}`);
    fetchData();
  };

  const handleStatusChange = async (s) => {
    setEditStatus(s);
    await api.put(`/api/projects/${id}`, { status: s });
    fetchData();
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  if (!project) return null;

  const availableUsers = allUsers.filter(u => !members.find(m => m.id === u.id));

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/projects')}>← Back</button>
          <h2>{project.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{project.description || 'No description'}</p>
        </div>
        {user?.role === 'admin' && (
          <select className="form-control" style={{ width: 'auto' }} value={editStatus} onChange={e => handleStatusChange(e.target.value)}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Tasks */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <div className="empty-state"><div className="icon">✅</div><p>No tasks in this project yet.</p></div>
          ) : (
            ['todo', 'in_progress', 'done'].map(status => {
              const filtered = tasks.filter(t => t.status === status);
              if (filtered.length === 0) return null;
              return (
                <div key={status} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)', marginBottom: 10 }}>{statusLabel[status]} ({filtered.length})</div>
                  {filtered.map(t => (
                    <div key={t.id} className="card" style={{ marginBottom: 8, padding: '12px 16px', background: 'var(--surface2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {t.assigned_to_name ? `👤 ${t.assigned_to_name}` : '⚪ Unassigned'}
                            {t.due_date && <span style={{ marginLeft: 10, color: new Date(t.due_date) < new Date() ? 'var(--danger)' : 'var(--text-muted)' }}>
                              📅 {new Date(t.due_date).toLocaleDateString()}
                            </span>}
                          </div>
                        </div>
                        <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Members */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16 }}>Members ({members.length})</h3>
            {user?.role === 'admin' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(!showAddMember)}>+ Add</button>
            )}
          </div>

          {showAddMember && (
            <div style={{ marginBottom: 14, display: 'flex', gap: 8 }}>
              <select className="form-control" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">Select user...</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={handleAddMember}>Add</button>
            </div>
          )}

          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {m.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {user?.role === 'admin' && m.id !== user.id && (
                  <button onClick={() => handleRemoveMember(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
