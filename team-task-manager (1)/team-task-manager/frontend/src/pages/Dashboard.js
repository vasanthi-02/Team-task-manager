import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, icon, color }) => (
  <div className="card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 32, fontFamily: 'Syne', fontWeight: 800, color }}>{value ?? '—'}</div>
      </div>
      <div style={{ fontSize: 28 }}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  const { stats, recentTasks } = data;

  const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
  const statusColor = { todo: 'var(--text-muted)', in_progress: 'var(--accent)', done: 'var(--success)' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard label="Total Tasks" value={stats.totalTasks} icon="✅" color="var(--accent)" />
        <StatCard label="Projects" value={stats.totalProjects} icon="📁" color="#43e97b" />
        <StatCard label="Overdue" value={stats.overdueTasks} icon="⚠️" color="var(--danger)" />
        {user?.role === 'admin' && <StatCard label="Users" value={stats.totalUsers} icon="👥" color="#ff6584" />}
      </div>

      {/* Task Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ marginBottom: 18, fontSize: 16 }}>Task Status Breakdown</h3>
          {['todo', 'in_progress', 'done'].map(s => {
            const count = stats.tasksByStatus[s] || 0;
            const total = stats.totalTasks || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={s} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: statusColor[s], fontWeight: 600 }}>{statusLabel[s]}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: statusColor[s], borderRadius: 4, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/tasks" className="btn btn-primary">+ Create New Task</Link>
            {user?.role === 'admin' && <Link to="/projects" className="btn btn-ghost">+ New Project</Link>}
            <Link to="/tasks?status=in_progress" className="btn btn-ghost">View In-Progress Tasks</Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>Recent Tasks</h3>
          <Link to="/tasks" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><p>No tasks yet</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>
                {recentTasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.project_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.assigned_to_name || '—'}</td>
                    <td><span className={`badge badge-${t.status}`}>{statusLabel[t.status]}</span></td>
                    <td style={{ color: t.due_date && new Date(t.due_date) < new Date() ? 'var(--danger)' : 'var(--text-muted)', fontSize: 13 }}>
                      {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
