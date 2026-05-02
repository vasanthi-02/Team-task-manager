import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', projectId: '' });
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project_id: '', assigned_to: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = () => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.projectId) params.append('projectId', filter.projectId);
    api.get(`/api/tasks?${params}`).then(r => setTasks(r.data.tasks)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    api.get('/api/projects').then(r => setProjects(r.data.projects));
    if (user?.role === 'admin') api.get('/api/users').then(r => setUsers(r.data.users));
  }, []);

  useEffect(() => { setLoading(true); fetchTasks(); }, [filter]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project_id: '', assigned_to: '' });
    setError(''); setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      project_id: task.project_id, assigned_to: task.assigned_to || ''
    });
    setError(''); setShowModal(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.assigned_to) delete payload.assigned_to;
      if (!payload.due_date) delete payload.due_date;

      if (editTask) {
        await api.put(`/api/tasks/${editTask.id}`, payload);
      } else {
        await api.post('/api/tasks', payload);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/api/tasks/${id}`);
    fetchTasks();
  };

  const handleStatusUpdate = async (task, newStatus) => {
    await api.put(`/api/tasks/${task.id}`, { status: newStatus });
    fetchTasks();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Tasks</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-control" style={{ width: 'auto' }} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filter.projectId} onChange={e => setFilter({ ...filter, projectId: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div> : (
        tasks.length === 0 ? (
          <div className="empty-state card"><div className="icon">✅</div><p>No tasks found.</p></div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Title</th><th>Project</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.project_name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.assigned_to_name || '—'}</td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto', border: 'none', background: 'transparent' }}
                          value={t.status}
                          onChange={e => handleStatusUpdate(t, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td style={{ fontSize: 13, color: t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done' ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editTask ? 'Edit Task' : 'New Task'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Title *</label>
                <input className="form-control" placeholder="Task title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Project *</label>
                  <select className="form-control" value={form.project_id}
                    onChange={e => setForm({ ...form, project_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select className="form-control" value={form.assigned_to}
                    onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="form-control" value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
