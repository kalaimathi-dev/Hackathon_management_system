import { useState, useEffect } from 'react';
import { hackathonAPI } from '../../services/api';

export default function HackathonManager() {
  const [hackathons, setHackathons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    assignmentStartDate: '',
    assignmentEndDate: '',
    submissionDeadline: '',
    maxParticipants: 100,
    tasksPerParticipant: 1,
    status: 'draft'
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      const response = await hackathonAPI.getAll();
      setHackathons(response.data.data.hackathons);
    } catch (error) {
      showMessage('Failed to load hackathons', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        await hackathonAPI.update(selectedHackathon._id, formData);
        showMessage('Hackathon updated successfully', 'success');
      } else {
        await hackathonAPI.create(formData);
        showMessage('Hackathon created successfully', 'success');
      }
      resetForm();
      loadHackathons();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleEdit = (hackathon) => {
    setSelectedHackathon(hackathon);
    setFormData({
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate.split('T')[0],
      endDate: hackathon.endDate.split('T')[0],
      assignmentStartDate: hackathon.assignmentStartDate.split('T')[0],
      assignmentEndDate: hackathon.assignmentEndDate.split('T')[0],
      submissionDeadline: hackathon.submissionDeadline.split('T')[0],
      maxParticipants: hackathon.maxParticipants,
      tasksPerParticipant: hackathon.tasksPerParticipant,
      status: hackathon.status
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) return;

    try {
      await hackathonAPI.delete(id);
      showMessage('Hackathon deleted successfully', 'success');
      loadHackathons();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      assignmentStartDate: '',
      assignmentEndDate: '',
      submissionDeadline: '',
      maxParticipants: 100,
      tasksPerParticipant: 1,
      status: 'draft'
    });
    setShowForm(false);
    setEditMode(false);
    setSelectedHackathon(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hackathon Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Create Hackathon'}
        </button>
      </div>

      {message && (
        <div style={messageType === 'success' ? styles.success : styles.error}>
          {message}
        </div>
      )}

      {showForm && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editMode ? 'Edit Hackathon' : 'Create New Hackathon'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={styles.input}
                  placeholder="Tech Hackathon 2024"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={styles.input}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                style={{...styles.input, resize: 'vertical'}}
                placeholder="Describe your hackathon..."
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assignment Start *</label>
                <input
                  type="date"
                  value={formData.assignmentStartDate}
                  onChange={(e) => setFormData({...formData, assignmentStartDate: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Assignment End *</label>
                <input
                  type="date"
                  value={formData.assignmentEndDate}
                  onChange={(e) => setFormData({...formData, assignmentEndDate: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Submission Deadline *</label>
                <input
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  min="1"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tasks Per Participant</label>
              <input
                type="number"
                value={formData.tasksPerParticipant}
                onChange={(e) => setFormData({...formData, tasksPerParticipant: e.target.value})}
                min="1"
                max="10"
                style={styles.input}
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
        <h2 style={styles.cardTitle}>All Hackathons ({hackathons.length})</h2>
        {hackathons.length === 0 ? (
          <p style={styles.emptyState}>No hackathons created yet.</p>
        ) : (
          <div style={styles.hackathonList}>
            {hackathons.map(hackathon => (
              <div key={hackathon._id} style={styles.hackathonCard}>
                <div style={styles.hackathonHeader}>
                  <div>
                    <h3 style={styles.hackathonTitle}>{hackathon.title}</h3>
                    <span style={getStatusBadge(hackathon.status)}>
                      {hackathon.status}
                    </span>
                  </div>
                  <div style={styles.actionButtons}>
                    <button onClick={() => handleEdit(hackathon)} style={styles.editButton}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(hackathon._id)} style={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </div>
                <p style={styles.hackathonDesc}>{hackathon.description}</p>
                <div style={styles.hackathonMeta}>
                  <span>📅 {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</span>
                  <span>👥 {hackathon.participants?.length || 0}/{hackathon.maxParticipants}</span>
                  <span>📝 {hackathon.tasksPerParticipant} tasks/participant</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusBadge = (status) => {
  const styles = {
    base: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      marginLeft: '12px'
    },
    active: { background: '#d4edda', color: '#155724' },
    draft: { background: '#fff3cd', color: '#856404' },
    completed: { background: '#d1ecf1', color: '#0c5460' },
    cancelled: { background: '#f8d7da', color: '#721c24' }
  };
  return { ...styles.base, ...styles[status] };
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333'
  },
  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
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
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333'
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
  hackathonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  hackathonCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    background: '#fafafa'
  },
  hackathonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  hackathonTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    display: 'inline-block',
    marginRight: '8px'
  },
  hackathonDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  hackathonMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#888',
    flexWrap: 'wrap'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    padding: '6px 16px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '6px 16px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
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