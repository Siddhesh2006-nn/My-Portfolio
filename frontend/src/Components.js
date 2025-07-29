import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tasks', icon: '📋' },
    { path: '/projects', label: 'Projects', icon: '🚀' }
  ];

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
              <p className="text-xs text-gray-500">Task Management System</p>
            </div>
          </div>
          
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
        </div>
      </div>
    </nav>
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

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete, onUpdate }) => {
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
      completed: 'bg-green-100 text-green-800'
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
      </div>

      {task.assignee && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Assigned to:</span> {task.assignee}
        </div>
      )}

      <div className="text-sm text-gray-500 mb-3">
        <span className="font-medium">Due:</span> {formatDate(task.due_date)}
      </div>

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

// Project Card Component
const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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

      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
        <span className="text-sm text-gray-600">
          {project.task_count} tasks
        </span>
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

// Task Modal Component
const TaskModal = ({ task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    assignee: task?.assignee || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.due_date) {
      submitData.due_date = new Date(submitData.due_date).toISOString();
    } else {
      delete submitData.due_date;
    }
    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
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
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Assignee</label>
            <input
              type="text"
              className="form-input"
              value={formData.assignee}
              onChange={e => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Enter assignee name"
            />
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

// Project Modal Component
const ProjectModal = ({ project, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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

// Kanban Board Component
const KanbanBoard = ({ project, onBack }) => {
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
    { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' }
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
            </div>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            + Add Task
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {task.assignee && (
                        <span className="text-xs text-gray-500">
                          {task.assignee}
                        </span>
                      )}
                    </div>
                    
                    {/* Status change buttons */}
                    <div className="mt-3 flex space-x-2">
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

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            onClose={() => setShowTaskModal(false)}
            onSubmit={handleCreateTask}
          />
        )}

        {editingTask && (
          <TaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
          />
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
  KanbanBoard
};

export default Components;