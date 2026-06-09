import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { api } from '../services/api';

interface AdminPanelProps {
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ addNotification }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAllUsers();
      setUsers(response.data.users);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
      addNotification(err.message || 'Error loading administration data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalTasks = users.reduce((acc, user) => acc + (user._count?.tasks || 0), 0);
  const avgTasks = totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        <p>Loading administration console...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-high)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Access Denied or Connection Failure</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-secondary" onClick={fetchUsers}>Retry Load</button>
      </div>
    );
  }

  return (
    <div className="admin-grid">
      {/* Admin Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Total System Users</h3>
            <p>{totalUsers}</p>
          </div>
          <div className="stat-icon-wrapper total">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Aggregate System Tasks</h3>
            <p>{totalTasks}</p>
          </div>
          <div className="stat-icon-wrapper progress">
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Average Tasks / User</h3>
            <p>{avgTasks}</p>
          </div>
          <div className="stat-icon-wrapper completed">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 className="admin-section-title">
          <Award size={20} style={{ color: 'var(--color-primary)' }} />
          <span>User Accounts Audit Directory</span>
        </h3>
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Identity</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Tasks Count</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`user-badge-role ${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {u._count?.tasks ?? 0} Tasks
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No registered user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
