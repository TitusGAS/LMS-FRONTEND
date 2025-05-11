import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaBook, FaUsers } from 'react-icons/fa';
import instructorApi from '../../services/instructorApi';
import './InstructorStyles.css';

const ModulesList = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await instructorApi.getModules();
      const modulesData = Array.isArray(response) ? response : response.results || [];
      setModules(modulesData);
    } catch (err) {
      setError('Failed to load modules. Please try again later.');
      setModules([]); // Ensure modules is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await instructorApi.deleteModule(moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
    } catch (err) {
        setError('Failed to delete module. Please try again.');
      }
  };

  return (
    <div className="modules-container">
      <div className="modules-header">
        <h2>Modules</h2>
        <button className="btn-primary" onClick={() => navigate('/dashboard/instructor/modules/create')}>Create New Module</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-container"><div className="loading">Loading modules...</div></div>
      ) : null}
      <div className="modules-grid">
        {modules.length === 0 && !loading ? (
          <div className="no-modules">No modules found. Create your first module to get started.</div>
        ) : (
          modules.map(module => (
          <div key={module.id} className="module-card">
              <div className="module-card-header">
              <h3>{module.title}</h3>
                <span className="module-code">Code: {module.code}</span>
              </div>
              <div className="module-card-body">
                <p>{module.description}</p>
              </div>
              <div className="module-card-actions">
                <button
                  className="icon-button"
                  title="Manage Content"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}/content`)}
                >
                  <FaBook /> Manage Content
                </button>
                <button
                  className="icon-button"
                  title="Manage Students"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}/assign-students`)}
                >
                  <FaUsers /> Manage Students
                </button>
                <button
                  className="icon-button"
                  title="Edit"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}/edit`)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="icon-button delete"
                  title="Delete"
                  onClick={() => handleDelete(module.id)}
              >
                  <FaTrash /> Delete
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModulesList; 