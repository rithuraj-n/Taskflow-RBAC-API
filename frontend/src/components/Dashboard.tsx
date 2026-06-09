import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, Clock, Edit2, Trash2, CheckSquare, ListTodo, AlertTriangle, Play } from 'lucide-react';
import { api } from '../services/api';
import { TaskModal } from './TaskModal';

interface DashboardProps {
  currentUser: any;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, addNotification }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 6 });
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Task Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, completed: 0 });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.tasks.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
        page: currentPage,
        limit: pagination.limit,
      });
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (err: any) {
      addNotification(err.message || 'Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats separately (just client-side aggregates or simple separate fetch if needed, but client-side from an unfiltered request is fast for demonstration, or we can fetch them via specific queries).
  // Let's do a fast query with all tasks to build accurate stats.
  const fetchStats = async () => {
    try {
      const response = await api.tasks.getTasks({ limit: 1000 }); // fetch up to 1000 tasks for stats
      const allTasks = response.data.tasks;
      const total = allTasks.length;
      const pending = allTasks.filter((t: any) => t.status === 'PENDING').length;
      const progress = allTasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
      const completed = allTasks.filter((t: any) => t.status === 'COMPLETED').length;
      setStats({ total, pending, progress, completed });
    } catch (err) {
      // fail silently for stats
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, currentPage]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchTasks();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [tasks]); // Refresh stats whenever tasks change

  const handleCreateTask = async (data: any) => {
    try {
      await api.tasks.createTask(data);
      addNotification('Task created successfully!', 'success');
      fetchTasks();
    } catch (err: any) {
      addNotification(err.message || 'Failed to create task.', 'error');
      throw err;
    }
  };

  const handleUpdateTask = async (data: any) => {
    try {
      await api.tasks.updateTask(editingTask.id, data);
      addNotification('Task updated successfully!', 'success');
      fetchTasks();
    } catch (err: any) {
      addNotification(err.message || 'Failed to update task.', 'error');
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.tasks.deleteTask(id);
        addNotification('Task deleted successfully!', 'success');
        fetchTasks();
      } catch (err: any) {
        addNotification(err.message || 'Failed to delete task.', 'error');
      }
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="dashboard-root">
      {/* Stats Board */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-icon-wrapper total">
            <ListSquareIcon size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-icon-wrapper pending">
            <Clock size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>In Progress</h3>
            <p>{stats.progress}</p>
          </div>
          <div className="stat-icon-wrapper progress">
            <Play size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h3>Completed</h3>
            <p>{stats.completed}</p>
          </div>
          <div className="stat-icon-wrapper completed">
            <CheckSquare size={24} />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="task-workspace">
        {/* Filters Sidebar */}
        <aside className="glass-card filters-sidebar">
          <h3 className="sidebar-title">Filters</h3>
          
          <div className="filter-group">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Status</h4>
            <div className={`filter-option ${statusFilter === '' ? 'active' : ''}`} onClick={() => { setStatusFilter(''); setCurrentPage(1); }}>
              All Statuses
            </div>
            <div className={`filter-option ${statusFilter === 'PENDING' ? 'active' : ''}`} onClick={() => { setStatusFilter('PENDING'); setCurrentPage(1); }}>
              Pending
            </div>
            <div className={`filter-option ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`} onClick={() => { setStatusFilter('IN_PROGRESS'); setCurrentPage(1); }}>
              In Progress
            </div>
            <div className={`filter-option ${statusFilter === 'COMPLETED' ? 'active' : ''}`} onClick={() => { setStatusFilter('COMPLETED'); setCurrentPage(1); }}>
              Completed
            </div>
          </div>

          <div className="filter-group">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Priority</h4>
            <div className={`filter-option ${priorityFilter === '' ? 'active' : ''}`} onClick={() => { setPriorityFilter(''); setCurrentPage(1); }}>
              All Priorities
            </div>
            <div className={`filter-option ${priorityFilter === 'LOW' ? 'active' : ''}`} onClick={() => { setPriorityFilter('LOW'); setCurrentPage(1); }}>
              Low Priority
            </div>
            <div className={`filter-option ${priorityFilter === 'MEDIUM' ? 'active' : ''}`} onClick={() => { setPriorityFilter('MEDIUM'); setCurrentPage(1); }}>
              Medium Priority
            </div>
            <div className={`filter-option ${priorityFilter === 'HIGH' ? 'active' : ''}`} onClick={() => { setPriorityFilter('HIGH'); setCurrentPage(1); }}>
              High Priority
            </div>
          </div>
        </aside>

        {/* Task Board Section */}
        <section className="task-board">
          <div className="dashboard-controls">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks by title or desc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
              <p>Loading task workspace...</p>
            </div>
          ) : (
            <div className="tasks-container">
              {tasks.length === 0 ? (
                <div className="glass-card empty-state">
                  <div className="empty-state-icon">
                    <ListTodo size={32} />
                  </div>
                  <h3>No tasks found</h3>
                  <p>Create a task to get started, or change your filtering filters.</p>
                  <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    <span>Create Task</span>
                  </button>
                </div>
              ) : (
                <div className="tasks-grid">
                  {tasks.map((task) => {
                    const overdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED';
                    return (
                      <div
                        key={task.id}
                        className={`glass-card task-card priority-${task.priority.toLowerCase()}`}
                      >
                        <div className="task-card-header">
                          <span className={`badge badge-status ${task.status.toLowerCase()}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`badge badge-priority ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="task-title" title={task.title}>{task.title}</h4>
                        
                        <p className="task-desc">
                          {task.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description provided.</span>}
                        </p>

                        <div className="task-card-footer">
                          <div className="task-meta">
                            <div className={`task-date ${overdue ? 'overdue' : ''}`} style={overdue ? { color: '#f87171', fontWeight: 600 } : {}}>
                              {overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
                              <span>{formatDate(task.dueDate)} {overdue && '(Overdue)'}</span>
                            </div>
                            
                            {currentUser.role === 'ADMIN' && task.user && (
                              <div className="task-owner">
                                <User size={12} />
                                <span>Owner: {task.user.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="task-actions">
                            <button
                              className="btn-icon edit"
                              onClick={() => openEditModal(task)}
                              title="Edit Task"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteTask(task.id)}
                              title="Delete Task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing tasks {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalItems)} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems} tasks
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Prev
                    </button>
                    <span className="pagination-page-indicator">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Task Modal Overlay */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  );
};

// Helper SVG Icon inside component
const ListSquareIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M8 12h8" />
    <path d="M8 8h8" />
    <path d="M8 16h8" />
  </svg>
);
