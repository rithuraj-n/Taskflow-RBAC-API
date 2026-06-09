import React, { useState, useEffect } from 'react';
import { Shield, LogOut, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'admin'>('tasks');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string }[]>([]);

  // Generate twinkling background stars
  useEffect(() => {
    const generatedStars = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 0.5}px`,
      delay: `${Math.random() * 5}s`,
    }));
    setStars(generatedStars);
  }, []);

  // Load user from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    // Listen for global auth logouts (triggered by Fetch API client on 401)
    const handleGlobalLogout = () => {
      setToken(null);
      setUser(null);
      addNotification('Session expired. Please log in again.', 'info');
    };
    
    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleAuthSuccess = (userData: any, userToken: string) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    setActiveTab('tasks');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    addNotification('Logged out successfully.', 'success');
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="app-container">
      {/* Twinkling Star Field Background */}
      <div className="stars-container-bg">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star-element twinkling-star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Animated Mesh Background Blobs */}
      <div className="mesh-gradient-blob blob-1"></div>
      <div className="mesh-gradient-blob blob-2"></div>
      <div className="mesh-gradient-blob blob-3"></div>

      {/* Toast Notification Container */}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast ${n.type}`} onClick={() => removeNotification(n.id)}>
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      {token && user ? (
        <>
          {/* Header Navigation */}
          <header className="app-header">
            <div className="header-container">
              <div className="header-brand">
                <Shield size={24} style={{ color: 'var(--color-primary)' }} />
                <span className="header-logo">TaskFlow Dashboard</span>
              </div>

              <nav className="header-nav">
                <button 
                  className={`nav-link btn-text ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', fontSize: '0.95rem' }}
                >
                  <LayoutDashboard size={16} />
                  <span>Tasks Workspace</span>
                </button>

                {user.role === 'ADMIN' && (
                  <button 
                    className={`nav-link btn-text ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', fontSize: '0.95rem' }}
                  >
                    <Settings size={16} />
                    <span>Admin Center</span>
                  </button>
                )}
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="user-badge">
                  <UserIcon size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                  <span className={`user-badge-role ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="main-content">
            {activeTab === 'tasks' ? (
              <Dashboard currentUser={user} addNotification={addNotification} />
            ) : (
              <AdminPanel addNotification={addNotification} />
            )}
          </main>
        </>
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} addNotification={addNotification} />
      )}
    </div>
  );
};

export default App;
