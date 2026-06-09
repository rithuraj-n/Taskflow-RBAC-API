import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AuthProps {
  onAuthSuccess: (user: any, token: string) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, addNotification }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await api.auth.register({ email, password, name, role });
        addNotification('Registration successful! Please login.', 'success');
        setIsRegister(false);
        setPassword('');
      } else {
        const response = await api.auth.login({ email, password });
        addNotification('Logged in successfully!', 'success');
        onAuthSuccess(response.data.user, response.data.token);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      addNotification(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setRole('USER');
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={32} />
            <span>TaskFlow API</span>
          </div>
          <h2 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isRegister 
              ? 'Sign up to manage your tasks with role-based access' 
              : 'Sign in to access your secure task dashboard'}
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            color: '#f87171',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="btn-icon"
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">ACCOUNT ROLE</label>
              <div className="role-toggle-group">
                <button
                  type="button"
                  className={`role-toggle-btn ${role === 'USER' ? 'active' : ''}`}
                  onClick={() => setRole('USER')}
                >
                  Regular User
                </button>
                <button
                  type="button"
                  className={`role-toggle-btn ${role === 'ADMIN' ? 'active' : ''}`}
                  onClick={() => setRole('ADMIN')}
                >
                  Administrator
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                {role === 'ADMIN' 
                  ? '⚠️ Admin users can view and delete tasks created by all users.'
                  : '✓ Standard users can only view and manage their own tasks.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button type="button" className="auth-switch-btn" onClick={toggleAuthMode}>
            <span className="auth-switch-text">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <span className="auth-action-link">
              {isRegister ? 'Sign in' : 'Sign up'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
