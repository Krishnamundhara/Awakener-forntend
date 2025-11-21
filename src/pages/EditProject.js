import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../utils/api';
import './EditProject.css';

export const EditProject = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsAPI.getProject(id);
      const project = response.data.project;
      setUrl(project.url);
      setName(project.name);
    } catch (err) {
      setError('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url || !name) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      await projectsAPI.updateProject(id, { url, name });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  return (
    <div className="edit-project-container">
      <div className="edit-project-card">
        <h1>Edit Project</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Project'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
