import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentAPI, submissionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ParticipantDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    submissionUrl: '',
    description: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        assignmentAPI.getMyAssignments(),
        submissionAPI.getMySubmissions()
      ]);
      setAssignments(assignmentsRes.data.data.assignments);
      setSubmissions(submissionsRes.data.data.submissions);
    } catch (error) {
      showMessage('Failed to load data', 'error');
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submissionAPI.create({
        assignmentId: selectedAssignment._id,
        ...submitForm
      });
      showMessage(response.data.message, 'success');
      setShowSubmitForm(false);
      setSubmitForm({ submissionUrl: '', description: '' });
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Submission failed', 'error');
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitForm(true);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {user?.name}!</h1>
          <p style={styles.subtitle}>Manage your hackathon assignments and submissions</p>
        </div>
      </div>

      {message && (
        <div style={messageType === 'success' ? styles.success : styles.error}>
          {message}
        </div>
      )}

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{assignments.length}</div>
          <div style={styles.statLabel}>Total Assignments</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {assignments.filter(a => a.status === 'submitted').length}
          </div>
          <div style={styles.statLabel}>Submitted</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {assignments.filter(a => a.status === 'evaluated').length}
          </div>
          <div style={styles.statLabel}>Evaluated</div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>My Assignments</h2>
        {assignments.length === 0 ? (
          <div style={styles.emptyStateBox}>
            <p style={styles.emptyText}>No assignments yet. Check back later!</p>
            <p style={styles.emptySubtext}>
              Make sure you're enrolled in a hackathon to receive task assignments.
            </p>
            <Link to="/participant/hackathons" style={styles.browseButton}>
              Browse Hackathons
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {assignments.map(assignment => (
              <div key={assignment._id} style={styles.assignmentCard}>
                <div style={styles.assignmentHeader}>
                  <h3 style={styles.assignmentTitle}>{assignment.taskId?.title}</h3>
                  <span style={getStatusBadge(assignment.status)}>
                    {assignment.status}
                  </span>
                </div>
                <p style={styles.assignmentDesc}>{assignment.taskId?.description}</p>
                <div style={styles.assignmentMeta}>
                  <span>💎 Points: {assignment.taskId?.points}</span>
                  <span>📊 Difficulty: {assignment.taskId?.difficulty}</span>
                </div>
                <div style={styles.assignmentMeta}>
                  <span>🎯 Method: {assignment.assignmentMethod}</span>
                  <span>📅 Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                </div>
                {assignment.status === 'assigned' && (
                  <button
                    onClick={() => openSubmitModal(assignment)}
                    style={styles.submitButton}
                  >
                    Submit Solution
                  </button>
                )}
                {assignment.status === 'evaluated' && assignment.score !== undefined && (
                  <div style={styles.scoreDisplay}>
                    <strong>Score: {assignment.score}/100</strong>
                    {assignment.remarks && <p style={styles.remarks}>{assignment.remarks}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSubmitForm && (
        <div style={styles.modal} onClick={() => setShowSubmitForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Submit Solution</h2>
            <h3 style={styles.taskTitle}>{selectedAssignment?.taskId?.title}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Submission URL *</label>
                <input
                  type="url"
                  value={submitForm.submissionUrl}
                  onChange={(e) => setSubmitForm({...submitForm, submissionUrl: e.target.value})}
                  required
                  placeholder="https://github.com/username/repo"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={submitForm.description}
                  onChange={(e) => setSubmitForm({...submitForm, description: e.target.value})}
                  required
                  placeholder="Describe your solution..."
                  rows={4}
                  style={{...styles.input, resize: 'vertical'}}
                />
              </div>
              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.primaryButton}>
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const getStatusBadge = (status) => {
  const styles = {
    base: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    assigned: { background: '#fff3cd', color: '#856404' },
    submitted: { background: '#d1ecf1', color: '#0c5460' },
    evaluated: { background: '#d4edda', color: '#155724' },
    late: { background: '#f8d7da', color: '#721c24' }
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
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  assignmentCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    background: '#fafafa'
  },
  assignmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  assignmentTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  assignmentDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  assignmentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#888',
    marginBottom: '8px'
  },
  submitButton: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '12px'
  },
  scoreDisplay: {
    marginTop: '12px',
    padding: '12px',
    background: '#e8f5e9',
    borderRadius: '8px',
    fontSize: '14px'
  },
  remarks: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#666'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  taskTitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '24px'
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
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  primaryButton: {
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
  secondaryButton: {
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
  emptyStateBox: {
    textAlign: 'center',
    padding: '60px 40px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '12px',
    fontWeight: '500'
  },
  emptySubtext: {
    fontSize: '15px',
    color: '#888',
    marginBottom: '24px'
  },
  browseButton: {
    display: 'inline-block',
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666'
  }
};