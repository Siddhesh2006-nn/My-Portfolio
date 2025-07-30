import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Components from "./Components";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const { 
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
} = Components;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="loading-spinner"></div>
    </div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Auth Pages
const LoginPage = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">TT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Techno Tower</h1>
          <p className="text-gray-600">Task Management System</p>
        </div>
        <LoginForm />
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">TT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Techno Tower</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        <RegisterForm />
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

// Enhanced Home Dashboard
const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamStats, setTeamStats] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchRecentTasks();
    fetchRecentProjects();
    fetchActivities();
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchTeamStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setRecentTasks(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setRecentProjects(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API}/activities?limit=10`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/team`);
      setTeamStats(response.data);
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600 text-lg">
            {user?.role === 'manager' ? 'Manager Dashboard - ' : ''}
            Techno Tower Task Management System
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            <StatsCard
              title="Total Tasks"
              value={stats.tasks.total}
              gradient="stats-card-total"
              icon="📋"
            />
            <StatsCard
              title="Completed"
              value={stats.tasks.completed}
              gradient="stats-card-completed"
              icon="✅"
            />
            <StatsCard
              title="In Progress"
              value={stats.tasks.in_progress}
              gradient="stats-card-active"
              icon="🔄"
            />
            <StatsCard
              title="Active Projects"
              value={stats.projects.active}
              gradient="stats-card-urgent"
              icon="🚀"
            />
            <StatsCard
              title="Team Members"
              value={stats.users.total}
              gradient="stats-card-total"
              icon="👥"
            />
            <StatsCard
              title="Templates"
              value={stats.templates.total}
              gradient="stats-card-completed"
              icon="📝"
            />
          </div>
        )}

        {/* Manager/Admin Dashboard */}
        {user && (user.role === 'admin' || user.role === 'manager') && teamStats && (
          <div className="mb-8">
            <TeamDashboard teamStats={teamStats} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Tasks & Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">My Recent Tasks</h3>
                <a href="/tasks" className="text-purple-600 hover:text-purple-800 font-medium">
                  View All →
                </a>
              </div>
              <div className="space-y-4">
                {recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    {task.assignee_name && (
                      <div className="text-sm text-gray-600 ml-4">
                        {task.assignee_name}
                      </div>
                    )}
                  </div>
                ))}
                {recentTasks.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent tasks</p>
                )}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Active Projects</h3>
                <a href="/projects" className="text-purple-600 hover:text-purple-800 font-medium">
                  View All →
                </a>
              </div>
              <div className="space-y-4">
                {recentProjects.map(project => (
                  <div key={project.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">{project.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on_hold' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{project.task_count} tasks</span>
                      <span>{project.completed_tasks}/{project.task_count} completed</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.task_count > 0 ? (project.completed_tasks / project.task_count) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {recentProjects.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No active projects</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Tasks Page
const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showBulkCreate, setShowBulkCreate] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [filter, assigneeFilter]);

  const fetchTasks = async () => {
    try {
      let url = `${API}/tasks`;
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('status', filter);
      if (assigneeFilter !== 'all') params.append('assignee_id', assigneeFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await axios.post(`${API}/tasks`, taskData);
      fetchTasks();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, taskData);
      fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
            <p className="text-gray-600">Manage all your independent tasks</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Use Template
            </button>
            <button
              onClick={() => setShowBulkCreate(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              Bulk Create
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'in_progress', 'completed', 'blocked'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      filter === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                    }`}
                  >
                    {status === 'all' ? 'All Tasks' : status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Assignee</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="form-select w-full"
              >
                <option value="all">All Assignees</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              onViewDetails={setSelectedTask}
              users={users}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
            >
              Create your first task
            </button>
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <TaskModal
            onClose={() => setShowModal(false)}
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

        {showTemplateModal && (
          <TaskTemplates
            onClose={() => setShowTemplateModal(false)}
            onUseTemplate={handleCreateTask}
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

// Enhanced Projects Page
const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await axios.post(`${API}/projects`, projectData);
      fetchProjects();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (projectId, projectData) => {
    try {
      await axios.put(`${API}/projects/${projectId}`, projectData);
      fetchProjects();
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (selectedProject) {
    return (
      <KanbanBoard
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        users={users}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
            <p className="text-gray-600">Organize tasks into projects with Kanban boards</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditingProject}
              onDelete={handleDeleteProject}
              onView={setSelectedProject}
              users={users}
            />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
            >
              Create your first project
            </button>
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <ProjectModal
            onClose={() => setShowModal(false)}
            onSubmit={handleCreateProject}
            users={users}
          />
        )}

        {editingProject && (
          <ProjectModal
            project={editingProject}
            onClose={() => setEditingProject(null)}
            onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
            users={users}
          />
        )}
      </div>
    </div>
  );
};

// Admin/Manager Pages
const AdminPage = () => {
  const { user } = useAuth();
  
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Administration</h1>
          <p className="text-gray-600">Manage users, templates, and system settings</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <UserManagement />
          <TaskTemplates showManagement={true} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;