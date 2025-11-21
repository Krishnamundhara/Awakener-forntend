import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../utils/api';
import { Trash2, Edit2, Plus, LogOut } from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.listProjects();
      setProjects(response.data.projects);
      setError('');
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    return status === 'UP' ? 'status-up' : status === 'DOWN' ? 'status-down' : 'status-unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Backend Awakener</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={() => navigate('/add-project')}>
            <Plus size={20} /> Add Project
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h2>No projects yet</h2>
            <p>Add your first backend URL to start monitoring</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-project')}>
              <Plus size={20} /> Add Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span className={`status-badge ${getStatusColor(project.last_status)}`}>
                    {project.last_status}
                  </span>
                </div>

                <div className="project-body">
                  <p className="project-url" title={project.url}>{project.url}</p>
                  
                  <div className="project-details">
                    <div className="detail">
                      <span className="label">Last Ping:</span>
                      <span className="value">{formatDate(project.last_ping_at)}</span>
                    </div>
                    {project.last_response_time && (
                      <div className="detail">
                        <span className="label">Response Time:</span>
                        <span className="value">{project.last_response_time}ms</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="project-footer">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => navigate(`/edit-project/${project.id}`)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
