import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tasks', icon: '📋' },
    { path: '/projects', label: 'Projects', icon: '🚀' }
  ];

  if (user && (user.role === 'admin' || user.role === 'manager')) {
    navItems.push({ path: '/admin', label: 'Admin', icon: '⚙️' });
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">TT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Techno Tower</h1>
              <p className="text-xs text-gray-500">Advanced Task Management v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems.map(item => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`nav-item ${
                    currentPath === item.path ? 'nav-item-active' : 'nav-item-inactive'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Login Form Component
const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      
      <div>
        <label className="form-label">Username</label>
        <input
          type="text"
          required
          className="form-input"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          placeholder="Enter your username"
        />
      </div>

      <div>
        <label className="form-label">Password</label>
        <input
          type="password"
          required
          className="form-input"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

// Register Form Component
const RegisterForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'operator',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Username</label>
          <input
            type="text"
            required
            className="form-input"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            placeholder="Username"
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            required
            className="form-input"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email address"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Full Name</label>
        <input
          type="text"
          required
          className="form-input"
          value={formData.full_name}
          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Your full name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="operator">Operator</option>
            <option value="qc_inspector">QC Inspector</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <div>
          <label className="form-label">Department</label>
          <input
            type="text"
            className="form-input"
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            placeholder="Department"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Password</label>
        <input
          type="password"
          required
          className="form-input"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          placeholder="Create a password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, gradient, icon }) => {
  return (
    <div className={`stats-card ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-3xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Enhanced Task Card Component
const TaskCard = ({ task, onEdit, onDelete, onUpdate, onViewDetails, users }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdate(task.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="task-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2">
          {task.title}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={() => onViewDetails(task)}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="View details"
          >
            👁️
          </button>
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-purple-600 p-1"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.template_id && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Template
          </span>
        )}
      </div>

      {task.assignee_name && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Assigned to:</span> {task.assignee_name}
        </div>
      )}

      <div className="text-sm text-gray-500 mb-3">
        <span className="font-medium">Due:</span> {formatDate(task.due_date)}
      </div>

      {task.estimated_hours && (
        <div className="text-sm text-gray-500 mb-3">
          <span className="font-medium">Estimated:</span> {task.estimated_hours}h
          {task.actual_hours && <span> | Actual: {task.actual_hours.toFixed(1)}h</span>}
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex space-x-2">
        {task.status !== 'completed' && (
          <button
            onClick={() => handleStatusChange(task.status === 'pending' ? 'in_progress' : 'completed')}
            disabled={isUpdating}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              task.status === 'pending'
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {isUpdating ? '...' : task.status === 'pending' ? 'Start Task' : 'Complete'}
          </button>
        )}
        {task.status === 'completed' && (
          <button
            onClick={() => handleStatusChange('pending')}
            disabled={isUpdating}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
          >
            {isUpdating ? '...' : 'Reopen'}
          </button>
        )}
      </div>
    </div>
  );
};

// Enhanced Project Card Component
const ProjectCard = ({ project, onEdit, onDelete, onView, users }) => {
  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const completionPercentage = project.task_count > 0 ? 
    Math.round((project.completed_tasks / project.task_count) * 100) : 0;

  return (
    <div className="project-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2">
          {project.name}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(project)}
            className="text-gray-400 hover:text-purple-600 p-1"
            title="Edit project"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete project"
          >
            🗑️
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
        <span className="text-sm text-gray-600">
          {completionPercentage}% complete
        </span>
      </div>

      {project.manager_name && (
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Manager:</span> {project.manager_name}
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{project.completed_tasks}/{project.task_count} tasks</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => onView(project)}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium"
      >
        View Kanban Board
      </button>
    </div>
  );
};

// Enhanced Task Modal Component
const TaskModal = ({ task, onClose, onSubmit, users = [] }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    estimated_hours: task?.estimated_hours || '',
    tags: task?.tags ? task.tags.join(', ') : '',
    dependencies: task?.dependencies || []
  });

  const [availableTasks, setAvailableTasks] = useState([]);

  useEffect(() => {
    if (task?.id) {
      fetchAvailableTasks();
    }
  }, [task]);

  const fetchAvailableTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      // Filter out the current task to prevent self-dependency
      const filtered = response.data.filter(t => t.id !== task?.id);
      setAvailableTasks(filtered);
    } catch (error) {
      console.error('Error fetching available tasks:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    if (submitData.due_date) {
      submitData.due_date = new Date(submitData.due_date).toISOString();
    } else {
      delete submitData.due_date;
    }
    
    if (submitData.estimated_hours) {
      submitData.estimated_hours = parseFloat(submitData.estimated_hours);
    } else {
      delete submitData.estimated_hours;
    }
    
    if (submitData.tags) {
      submitData.tags = submitData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else {
      submitData.tags = [];
    }
    
    onSubmit(submitData);
  };

  const addDependency = () => {
    setFormData({
      ...formData,
      dependencies: [...formData.dependencies, { task_id: '', dependency_type: 'finish_to_start' }]
    });
  };

  const removeDependency = (index) => {
    const newDeps = formData.dependencies.filter((_, i) => i !== index);
    setFormData({ ...formData, dependencies: newDeps });
  };

  const updateDependency = (index, field, value) => {
    const newDeps = [...formData.dependencies];
    newDeps[index][field] = value;
    setFormData({ ...formData, dependencies: newDeps });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label">Assignee</label>
              <select
                className="form-select"
                value={formData.assignee_id}
                onChange={e => setFormData({ ...formData, assignee_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={formData.estimated_hours}
                onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="e.g., 4.5"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., manufacturing, quality, urgent"
            />
          </div>

          {/* Task Dependencies */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Task Dependencies</label>
              <button
                type="button"
                onClick={addDependency}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                + Add Dependency
              </button>
            </div>
            
            {formData.dependencies.map((dep, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  className="form-select flex-1"
                  value={dep.task_id}
                  onChange={e => updateDependency(index, 'task_id', e.target.value)}
                >
                  <option value="">Select task</option>
                  {availableTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeDependency(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Project Modal Component
const ProjectModal = ({ project, onClose, onSubmit, users = [] }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    manager_id: project?.manager_id || '',
    start_date: project?.start_date ? project.start_date.split('T')[0] : '',
    end_date: project?.end_date ? project.end_date.split('T')[0] : '',
    estimated_hours: project?.estimated_hours || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    if (submitData.start_date) {
      submitData.start_date = new Date(submitData.start_date).toISOString();
    } else {
      delete submitData.start_date;
    }
    
    if (submitData.end_date) {
      submitData.end_date = new Date(submitData.end_date).toISOString();
    } else {
      delete submitData.end_date;
    }
    
    if (submitData.estimated_hours) {
      submitData.estimated_hours = parseFloat(submitData.estimated_hours);
    } else {
      delete submitData.estimated_hours;
    }
    
    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="form-label">Project Manager</label>
            <select
              className="form-select"
              value={formData.manager_id}
              onChange={e => setFormData({ ...formData, manager_id: e.target.value })}
            >
              <option value="">No manager assigned</option>
              {users.filter(user => user.role === 'manager' || user.role === 'admin').map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Estimated Total Hours</label>
            <input
              type="number"
              step="0.5"
              className="form-input"
              value={formData.estimated_hours}
              onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })}
              placeholder="e.g., 120"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              {project ? 'Update Project' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Templates Component
const TaskTemplates = ({ onClose, onUseTemplate, users = [], showManagement = false }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [taskData, setTaskData] = useState({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const response = await axios.post(`${API}/templates/${template.id}/use`, taskData);
      if (onUseTemplate) {
        onUseTemplate(response.data);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      await axios.post(`${API}/templates`, templateData);
      fetchTemplates();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  if (showCreateModal) {
    return <TaskTemplateModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateTemplate} />;
  }

  if (selectedTemplate) {
    return (
      <div className="modal-overlay" onClick={() => setSelectedTemplate(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Use Template: {selectedTemplate.name}</h2>
            <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Assignee</label>
              <select
                className="form-select"
                value={taskData.assignee_id || ''}
                onChange={e => setTaskData({ ...taskData, assignee_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={taskData.due_date || ''}
                onChange={e => setTaskData({ ...taskData, due_date: e.target.value })}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Create Task from Template
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={onClose ? "modal-overlay" : ""} onClick={onClose}>
      <div className={onClose ? "modal-content max-w-4xl" : "bg-white rounded-2xl shadow-lg p-6"} onClick={e => onClose && e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {showManagement ? 'Task Templates Management' : 'Choose Template'}
          </h2>
          <div className="flex items-center space-x-3">
            {(showManagement && (user?.role === 'admin' || user?.role === 'manager')) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                + New Template
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-800 mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Priority:</span> {template.priority}
                </div>
                {template.estimated_hours && (
                  <div className="text-sm">
                    <span className="font-medium">Est. Hours:</span> {template.estimated_hours}h
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Used:</span> {template.usage_count} times
                </div>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => showManagement ? null : setSelectedTemplate(template)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {showManagement ? 'View Details' : 'Use Template'}
              </button>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No templates available</p>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
              >
                Create your first template
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Task Template Modal Component
const TaskTemplateModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title_template: '',
    description_template: '',
    priority: 'medium',
    estimated_hours: '',
    tags: '',
    category: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    if (submitData.estimated_hours) {
      submitData.estimated_hours = parseFloat(submitData.estimated_hours);
    } else {
      delete submitData.estimated_hours;
    }
    
    if (submitData.tags) {
      submitData.tags = submitData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else {
      submitData.tags = [];
    }
    
    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Task Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Template Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Quality Control Inspection"
            />
          </div>

          <div>
            <label className="form-label">Template Description</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this template"
            />
          </div>

          <div>
            <label className="form-label">Task Title Template *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.title_template}
              onChange={e => setFormData({ ...formData, title_template: e.target.value })}
              placeholder="e.g., Quality Control - Production Line A"
            />
          </div>

          <div>
            <label className="form-label">Task Description Template</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={formData.description_template}
              onChange={e => setFormData({ ...formData, description_template: e.target.value })}
              placeholder="Standard description for tasks created from this template"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label">Est. Hours</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={formData.estimated_hours}
                onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., QC, Maintenance"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., quality, inspection, routine"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              Create Template
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Time Tracker Component
const TimeTracker = ({ task }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);

  useEffect(() => {
    // Check if there's an active time entry
    if (task.time_entries) {
      const active = task.time_entries.find(entry => !entry.end_time);
      setActiveEntry(active);
      setIsTracking(!!active);
    }
  }, [task]);

  const startTracking = async () => {
    try {
      await axios.post(`${API}/tasks/${task.id}/time/start`, {
        description: 'Time tracking started'
      });
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting time tracking:', error);
    }
  };

  const stopTracking = async () => {
    try {
      await axios.post(`${API}/tasks/${task.id}/time/stop`, {
        description: 'Time tracking stopped'
      });
      setIsTracking(false);
      setActiveEntry(null);
    } catch (error) {
      console.error('Error stopping time tracking:', error);
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <h4 className="font-semibold text-gray-800 mb-3">Time Tracking</h4>
      
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {task.actual_hours ? (
            <span>Total: {task.actual_hours.toFixed(1)} hours</span>
          ) : (
            <span>No time tracked yet</span>
          )}
        </div>
        
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTracking
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {isTracking ? '⏹ Stop Tracking' : '▶️ Start Tracking'}
        </button>
      </div>

      {task.time_entries && task.time_entries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Time Entries:</p>
          {task.time_entries.slice(-3).map((entry, index) => (
            <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded">
              {entry.end_time ? (
                <span>{entry.duration_minutes} minutes</span>
              ) : (
                <span className="text-green-600">⏱ Active</span>
              )}
              {entry.description && <span> - {entry.description}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Task Comments Component
const TaskComments = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API}/tasks/${taskId}/comments`, {
        content: newComment
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      <form onSubmit={addComment} className="mb-4">
        <textarea
          className="form-textarea"
          rows="3"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-800">{comment.user_name}</span>
              <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
};

// Activity Feed Component
const ActivityFeed = ({ activities }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = (activityType) => {
    const icons = {
      task_created: '📝',
      task_updated: '✏️',
      task_completed: '✅',
      project_created: '🚀',
      comment_added: '💬',
      template_used: '📋'
    };
    return icons[activityType] || '📌';
  };

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-medium">{activity.user_name}</span>
              {' '}{activity.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
      
      {activities.length === 0 && (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      )}
    </div>
  );
};

// Team Dashboard Component
const TeamDashboard = ({ teamStats }) => {
  if (!teamStats || !teamStats.team_stats) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Team Performance</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Team Member</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Tasks</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Completed</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Success Rate</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg. Hours</th>
            </tr>
          </thead>
          <tbody>
            {teamStats.team_stats.map(member => (
              <tr key={member.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{member.user_name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                    {member.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">{member.total_tasks}</td>
                <td className="py-3 px-4 text-center">{member.completed_tasks}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.completion_rate >= 80 ? 'bg-green-100 text-green-800' :
                    member.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.completion_rate}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center">{member.avg_completion_time_hours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  if (loading) {
    return <div className="loading-spinner mx-auto"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">User Management</h3>
      
      <div className="space-y-3">
        {users.map(userData => (
          <div key={userData.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <p className="font-medium text-gray-800">{userData.full_name}</p>
              <p className="text-sm text-gray-600">{userData.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                  {userData.role.replace('_', ' ')}
                </span>
                {userData.department && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {userData.department}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {userData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <p className="text-gray-500 text-center py-4">No users found</p>
      )}
    </div>
  );
};

// Enhanced Kanban Board Component
const KanbanBoard = ({ project, onBack, users = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjectTasks();
  }, [project.id]);

  const fetchProjectTasks = async () => {
    try {
      const response = await axios.get(`${API}/projects/${project.id}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await axios.post(`${API}/tasks`, { ...taskData, project_id: project.id });
      fetchProjectTasks();
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, taskData);
      fetchProjectTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      fetchProjectTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const columns = [
    { id: 'pending', title: 'To Do', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-50 border-red-200' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Projects
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
              {project.manager_name && (
                <p className="text-sm text-gray-500">Manager: {project.manager_name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            + Add Task
          </button>
        </div>

        {/* Enhanced Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className={`kanban-column border-2 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {getTasksByStatus(column.id).map(task => (
                  <div key={task.id} className="kanban-card">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 flex-1 mr-2">
                        {task.title}
                      </h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-gray-400 hover:text-blue-600 text-sm"
                          title="View details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-gray-400 hover:text-purple-600 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-600 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {task.assignee_name && (
                        <span className="text-xs text-gray-500">
                          {task.assignee_name}
                        </span>
                      )}
                    </div>

                    {task.estimated_hours && (
                      <div className="text-xs text-gray-500 mb-2">
                        Est: {task.estimated_hours}h
                        {task.actual_hours && <span> | Act: {task.actual_hours.toFixed(1)}h</span>}
                      </div>
                    )}
                    
                    {/* Status change buttons */}
                    <div className="flex space-x-1">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })}
                          className="flex-1 bg-blue-100 text-blue-800 py-1 px-2 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => handleUpdateTask(task.id, { status: 'pending' })}
                            className="flex-1 bg-yellow-100 text-yellow-800 py-1 px-2 rounded text-xs font-medium hover:bg-yellow-200 transition-colors"
                          >
                            To Do
                          </button>
                          <button
                            onClick={() => handleUpdateTask(task.id, { status: 'completed' })}
                            className="flex-1 bg-green-100 text-green-800 py-1 px-2 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            Done
                          </button>
                        </>
                      )}
                      {task.status === 'completed' && (
                        <button
                          onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })}
                          className="flex-1 bg-blue-100 text-blue-800 py-1 px-2 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                      {task.status === 'blocked' && (
                        <button
                          onClick={() => handleUpdateTask(task.id, { status: 'pending' })}
                          className="flex-1 bg-yellow-100 text-yellow-800 py-1 px-2 rounded text-xs font-medium hover:bg-yellow-200 transition-colors"
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Task Modals */}
        {showTaskModal && (
          <TaskModal
            onClose={() => setShowTaskModal(false)}
            onSubmit={handleCreateTask}
            users={users}
          />
        )}

        {editingTask && (
          <TaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
            users={users}
          />
        )}

        {selectedTask && (
          <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
            <div className="modal-content max-w-4xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Task Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700">Title:</label>
                      <p className="text-gray-600">{selectedTask.title}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Description:</label>
                      <p className="text-gray-600">{selectedTask.description || 'No description'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-gray-700">Status:</label>
                        <p className="text-gray-600">{selectedTask.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Priority:</label>
                        <p className="text-gray-600">{selectedTask.priority}</p>
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Assignee:</label>
                      <p className="text-gray-600">{selectedTask.assignee_name || 'Unassigned'}</p>
                    </div>
                  </div>
                  
                  <TimeTracker task={selectedTask} />
                </div>
                
                <div>
                  <TaskComments taskId={selectedTask.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Components = {
  Navigation,
  TaskCard,
  ProjectCard,
  TaskModal,
  ProjectModal,
  StatsCard,
  KanbanBoard,
  LoginForm,
  RegisterForm,
  UserManagement,
  TaskTemplates,
  ActivityFeed,
  TeamDashboard,
  TimeTracker,
  TaskComments
};

export default Components;