import { useState, useEffect } from 'react';
import { assignmentAPI, hackathonAPI, taskAPI } from '../../services/api';

export default function AssignmentManager() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const [manualForm, setManualForm] = useState({
    taskId: '',
    participantId: ''
  });

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      loadAssignments();
      loadTasks();
      checkAssignmentWindow();
    }
  }, [selectedHackathon]);

  const checkAssignmentWindow = async () => {
    try {
      const response = await hackathonAPI.getById(selectedHackathon);
      const hackathon = response.data.data.hackathon;
      const now = new Date();
      const assignStart = new Date(hackathon.assignmentStartDate);
      const assignEnd = new Date(hackathon.assignmentEndDate);
      
      if (hackathon.status !== 'active') {
        showMessage(`Hackathon status is "${hackathon.status}". Change it to "active" to assign tasks.`, 'error');
      } else if (now < assignStart) {
        showMessage(`Assignment window opens on ${assignStart.toLocaleDateString()}`, 'error');
      } else if (now > assignEnd) {
        showMessage(`Assignment window closed on ${assignEnd.toLocaleDateString()}`, 'error');
      }
    } catch (error) {
      console.error('Error checking assignment window:', error);
    }
  };

  const loadHackathons = async () => {
    try {
      const response = await hackathonAPI.getAll('active');
      setHackathons(response.data.data.hackathons);
    } catch (error) {
      showMessage('Failed to load hackathons', 'error');
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await assignmentAPI.getByHackathon(selectedHackathon);
      setAssignments(response.data.data.assignments);
    } catch (error) {
      showMessage('Failed to load assignments', 'error');
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

  const handleRandomAssignment = async () => {
    if (!selectedHackathon) {
      showMessage('Please select a hackathon', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to randomly assign tasks to all participants?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await assignmentAPI.randomAssign({ hackathonId: selectedHackathon });
      showMessage(response.data.message, 'success');
      loadAssignments();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Random assignment failed', 'error');
    }
    setLoading(false);
  };

  const handleSmartAssignment = async () => {
    if (!selectedHackathon) {
      showMessage('Please select a hackathon', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to use smart (skill-based) assignment?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await assignmentAPI.smartAssign({ hackathonId: selectedHackathon });
      showMessage(response.data.message, 'success');
      loadAssignments();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Smart assignment failed', 'error');
    }
    setLoading(false);
  };

  const handleManualAssignment = async (e) => {
    e.preventDefault();
    
    if (!selectedHackathon || !manualForm.taskId || !manualForm.participantId) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await assignmentAPI.manualAssign({
        hackathonId: selectedHackathon,
        taskId: manualForm.taskId,
        participantId: manualForm.participantId
      });
      showMessage(response.data.message, 'success');
      setManualForm({ taskId: '', participantId: '' });
      loadAssignments();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Manual assignment failed', 'error');
    }
    setLoading(false);
  };

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to unassign this task?')) {
      return;
    }

    try {
      const response = await assignmentAPI.unassign(assignmentId);
      showMessage(response.data.message, 'success');
      loadAssignments();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to unassign', 'error');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Task Assignment Manager</h1>

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
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>📅 Assignment Window Information</h3>
            <p style={styles.infoText}>
              <strong>Today's Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
            <p style={styles.infoNote}>
              ⚠️ If you see an error above, edit your hackathon to set assignment dates that include today.
              Go to <strong>Hackathons</strong> → <strong>Edit</strong> → Update dates → Save
            </p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Automatic Assignment</h2>
            <div style={styles.buttonGroup}>
              <button
                onClick={handleRandomAssignment}
                disabled={loading}
                style={{...styles.button, ...styles.primaryButton}}
              >
                🎲 Auto Assign (Random)
              </button>
              <button
                onClick={handleSmartAssignment}
                disabled={loading}
                style={{...styles.button, ...styles.secondaryButton}}
              >
                🧠 Smart Assign (Skill-based)
              </button>
            </div>
            <p style={styles.hint}>
              Random: Assigns tasks randomly. Smart: Matches tasks to participant skills.
            </p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Manual Assignment</h2>
            <form onSubmit={handleManualAssignment} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task</label>
                <select
                  value={manualForm.taskId}
                  onChange={(e) => setManualForm({...manualForm, taskId: e.target.value})}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select Task --</option>
                  {tasks.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Participant ID</label>
                <input
                  type="text"
                  value={manualForm.participantId}
                  onChange={(e) => setManualForm({...manualForm, participantId: e.target.value})}
                  required
                  placeholder="Enter participant ID"
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{...styles.button, ...styles.primaryButton}}
              >
                ➕ Assign Manually
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Current Assignments ({assignments.length})</h2>
            <div style={styles.tableContainer}>
              {assignments.length === 0 ? (
                <p style={styles.emptyState}>No assignments yet. Use the buttons above to assign tasks.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Participant</th>
                      <th style={styles.th}>Task</th>
                      <th style={styles.th}>Method</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Assigned</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a._id} style={styles.tr}>
                        <td style={styles.td}>{a.participantId?.name}</td>
                        <td style={styles.td}>{a.taskId?.title}</td>
                        <td style={styles.td}>
                          <span style={getMethodBadgeStyle(a.assignmentMethod)}>
                            {a.assignmentMethod}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadgeStyle(a.status)}>
                            {a.status}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(a.assignedAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          {a.status === 'assigned' && (
                            <button
                              onClick={() => handleUnassign(a._id)}
                              style={styles.dangerButton}
                            >
                              Unassign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const getMethodBadgeStyle = (method) => ({
  ...styles.badge,
  background: method === 'random' ? '#e3f2fd' : method === 'smart' ? '#f3e5f5' : '#fff3e0',
  color: method === 'random' ? '#1976d2' : method === 'smart' ? '#7b1fa2' : '#e65100'
});

const getStatusBadgeStyle = (status) => ({
  ...styles.badge,
  background: status === 'submitted' ? '#e8f5e9' : status === 'evaluated' ? '#c8e6c9' : '#fff9c4',
  color: status === 'submitted' ? '#2e7d32' : status === 'evaluated' ? '#1b5e20' : '#f57f17'
});

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
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white'
  },
  dangerButton: {
    padding: '6px 12px',
    background: '#ff5252',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  hint: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
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
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #eee',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666'
  },
  tr: {
    borderBottom: '1px solid #f5f5f5'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block'
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
  },
  infoCard: {
    background: '#fff8e1',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px'
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  infoNote: {
    fontSize: '13px',
    color: '#856404',
    marginTop: '12px',
    padding: '12px',
    background: '#fff3cd',
    borderRadius: '6px',
    lineHeight: '1.6'
  }
};