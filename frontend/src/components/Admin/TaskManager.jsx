import { useState, useEffect } from 'react';
import { taskAPI, hackathonAPI } from '../../services/api';

export default function TaskManager() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: '',
    points: 100,
    resources: []
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      loadTasks();
    }
  }, [selectedHackathon]);

  const loadHackathons = async () => {
    try {
      const response = await hackathonAPI.getAll();
      setHackathons(response.data.data.hackathons);
    } catch (error) {
      showMessage('Failed to load hackathons', 'error');
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getByHackathon(selectedHackathon);
      setTasks(response.data.data.tasks);
    } catch (error) {
      showMessage('Failed to load tasks', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHackathon) {
      showMessage('Please select a hackathon first', 'error');
      return;
    }

    setLoading(true);
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const taskData = {
        ...formData,
        tags: tagsArray,
        hackathonId: selectedHackathon
      };

      if (editMode) {
        await taskAPI.update(selectedTask._id, taskData);
        showMessage('Task updated successfully', 'success');
      } else {
        await taskAPI.create(taskData);
        showMessage('Task created successfully', 'success');
      }
      resetForm();
      loadTasks();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      difficulty: task.difficulty,
      tags: task.tags.join(', '),
      points: task.points,
      resources: task.resources || []
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.delete(id);
      showMessage('Task deleted successfully', 'success');
      loadTasks();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      tags: '',
      points: 100,
      resources: []
    });
    setShowForm(false);
    setEditMode(false);
    setSelectedTask(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Task Manager</h1>

      {message && (
        <div style={messageType === 'success' ? styles.success : styles.error}>
          {message}
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Select Hackathon</h2>
        <select
          value={selectedHackathon}
          onChange={(e) => setSelectedHackathon(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Select Hackathon --</option>
          {hackathons.map(h => (
            <option key={h._id} value={h._id}>{h.title}</option>
          ))}
        </select>
      </div>

      {selectedHackathon && (
        <>
          <div style={styles.header}>
            <h2 style={styles.sectionTitle}>Tasks</h2>
            <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
              {showForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>

          {showForm && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {editMode ? 'Edit Task' : 'Create New Task'}
              </h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    style={styles.input}
                    placeholder="Build a REST API"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    rows={4}
                    style={{...styles.input, resize: 'vertical'}}
                    placeholder="Detailed task description..."
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      style={styles.input}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Points</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({...formData, points: e.target.value})}
                      min="0"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    style={styles.input}
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>

                <div style={styles.buttonGroup}>
                  <button type="submit" disabled={loading} style={styles.submitButton}>
                    {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} style={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>All Tasks ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <p style={styles.emptyState}>No tasks created yet for this hackathon.</p>
            ) : (
              <div style={styles.taskGrid}>
                {tasks.map(task => (
                  <div key={task._id} style={styles.taskCard}>
                    <div style={styles.taskHeader}>
                      <h4 style={styles.taskTitle}>{task.title}</h4>
                      <div style={styles.actionButtons}>
                        <button onClick={() => handleEdit(task)} style={styles.editButton}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(task._id)} style={styles.deleteButton}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p style={styles.taskDesc}>{task.description}</p>
                    <div style={styles.taskMeta}>
                      <span style={getDifficultyBadge(task.difficulty)}>
                        {task.difficulty}
                      </span>
                      <span style={styles.points}>💎 {task.points} pts</span>
                      {task.isAssigned && (
                        <span style={styles.assignedBadge}>
                          Assigned ({task.assignedCount})
                        </span>
                      )}
                    </div>
                    {task.tags.length > 0 && (
                      <div style={styles.tags}>
                        {task.tags.map((tag, idx) => (
                          <span key={idx} style={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const getDifficultyBadge = (difficulty) => {
  const colors = {
    easy: { background: '#d4edda', color: '#155724' },
    medium: { background: '#fff3cd', color: '#856404' },
    hard: { background: '#f8d7da', color: '#721c24' }
  };
  return {
    ...styles.badge,
    ...colors[difficulty]
  };
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333'
  },
  addButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333'
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  taskCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    background: '#fafafa'
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  taskTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: '12px'
  },
  taskDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  points: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  assignedBadge: {
    padding: '4px 10px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  tag: {
    padding: '4px 10px',
    background: '#f0f0f0',
    color: '#666',
    borderRadius: '4px',
    fontSize: '11px'
  },
  actionButtons: {
    display: 'flex',
    gap: '6px'
  },
  editButton: {
    padding: '4px 12px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '4px 12px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  success: {
    background: '#d4edda',
    color: '#155724',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb'
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '15px'
  }
};