import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    api.get('/api/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/api/projects', form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/api/projects/${id}`);
    fetchProjects();
  };

  const statusColors = { active: 'var(--success)', completed: 'var(--accent)', archived: 'var(--text-muted)' };

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>Projects</h2>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📁</div>
          <p>No projects yet. {user?.role === 'admin' ? 'Create one to get started!' : 'Ask an admin to create a project.'}</p>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(p => (
            <div key={p.id} className="card project-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
                {user?.role === 'admin' && (
                  <button className="btn btn-sm" style={{ background: 'none', color: 'var(--danger)', padding: '2px 6px', border: 'none', cursor: 'pointer', fontSize: 16 }}
                    onClick={() => handleDelete(p.id)}>🗑</button>
                )}
              </div>
              <h3 style={{ marginBottom: 6, fontSize: 17 }}>{p.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14, minHeight: 36 }}>
                {p.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                <span>👥 {p.member_count} members</span>
                <span>✅ {p.task_count} tasks</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>By {p.created_by_name}</span>
                <Link to={`/projects/${p.id}`} className="btn btn-ghost btn-sm">Open →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input className="form-control" placeholder="e.g., Website Redesign"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} placeholder="What is this project about?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
