import { useState, useEffect } from 'react';
import { judgeAPI, hackathonAPI } from '../../services/api';

export default function JudgeDashboard() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    score: '',
    feedback: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      loadSubmissions();
      loadLeaderboard();
    }
  }, [selectedHackathon]);

  const loadHackathons = async () => {
    try {
      const response = await hackathonAPI.getAll('active');
      setHackathons(response.data.data.hackathons);
    } catch (error) {
      showMessage('Failed to load hackathons', 'error');
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await judgeAPI.getPending(selectedHackathon);
      setSubmissions(response.data.data.submissions);
    } catch (error) {
      showMessage('Failed to load submissions', 'error');
    }
  };

  const loadLeaderboard = async () => {
    try {
      console.log('Loading leaderboard for hackathon:', selectedHackathon);
      const response = await judgeAPI.getLeaderboard(selectedHackathon);
      console.log('Leaderboard response:', response.data);
      const leaderboardData = response.data.data.leaderboard || [];
      console.log('Leaderboard data:', leaderboardData);
      setLeaderboard(leaderboardData);
      
      if (leaderboardData.length === 0) {
        console.log('No leaderboard data found. Checking submissions...');
        // Also load evaluated submissions to debug
        const evalResponse = await judgeAPI.getEvaluated(selectedHackathon);
        console.log('Evaluated submissions:', evalResponse.data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const openEvaluateModal = (submission) => {
    setSelectedSubmission(submission);
    setEvaluationForm({ score: '', feedback: '' });
    setShowEvaluateModal(true);
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await judgeAPI.evaluate(selectedSubmission._id, {
        score: parseInt(evaluationForm.score),
        feedback: evaluationForm.feedback
      });
      showMessage(response.data.message, 'success');
      setShowEvaluateModal(false);
      loadSubmissions();
      loadLeaderboard();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Evaluation failed', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Judge Dashboard</h1>

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
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Pending Evaluations ({submissions.length})</h2>
            {submissions.length === 0 ? (
              <p style={styles.emptyState}>No pending submissions to evaluate.</p>
            ) : (
              <div style={styles.submissionGrid}>
                {submissions.map(submission => (
                  <div key={submission._id} style={styles.submissionCard}>
                    <div style={styles.submissionHeader}>
                      <div>
                        <h3 style={styles.submissionTitle}>{submission.taskId?.title}</h3>
                        <p style={styles.participantName}>
                          by {submission.participantId?.name}
                        </p>
                      </div>
                      {submission.isLate && (
                        <span style={styles.lateBadge}>Late</span>
                      )}
                    </div>
                    
                    <p style={styles.submissionDesc}>{submission.description}</p>
                    
                    <div style={styles.submissionMeta}>
                      <span>📅 {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      <span>💎 {submission.taskId?.points} points</span>
                    </div>
                    
                    <a
                      href={submission.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.viewLink}
                    >
                      🔗 View Submission
                    </a>
                    
                    <button
                      onClick={() => openEvaluateModal(submission)}
                      style={styles.evaluateButton}
                    >
                      Evaluate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p style={styles.emptyState}>No evaluated submissions yet.</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Participant</th>
                      <th style={styles.th}>Submissions</th>
                      <th style={styles.th}>Total Score</th>
                      <th style={styles.th}>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry._id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={getRankBadge(index + 1)}>{index + 1}</span>
                        </td>
                        <td style={styles.td}>{entry.participantName}</td>
                        <td style={styles.td}>{entry.submissionCount}</td>
                        <td style={styles.td}><strong>{entry.totalScore}</strong></td>
                        <td style={styles.td}>{entry.averageScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showEvaluateModal && (
        <div style={styles.modal} onClick={() => setShowEvaluateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Evaluate Submission</h2>
            <h3 style={styles.taskTitle}>
              {selectedSubmission?.taskId?.title} - {selectedSubmission?.participantId?.name}
            </h3>
            
            <form onSubmit={handleEvaluate} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Score (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationForm.score}
                  onChange={(e) => setEvaluationForm({...evaluationForm, score: e.target.value})}
                  required
                  style={styles.input}
                  placeholder="Enter score"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Feedback</label>
                <textarea
                  value={evaluationForm.feedback}
                  onChange={(e) => setEvaluationForm({...evaluationForm, feedback: e.target.value})}
                  rows={4}
                  style={{...styles.input, resize: 'vertical'}}
                  placeholder="Provide feedback to the participant..."
                />
              </div>
              
              <div style={styles.buttonGroup}>
                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? 'Submitting...' : 'Submit Evaluation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEvaluateModal(false)}
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

const getRankBadge = (rank) => {
  const colors = {
    1: { background: '#ffd700', color: '#000' },
    2: { background: '#c0c0c0', color: '#000' },
    3: { background: '#cd7f32', color: '#fff' },
    default: { background: '#e0e0e0', color: '#333' }
  };
  
  const style = colors[rank] || colors.default;
  
  return {
    ...styles.rankBadge,
    ...style
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
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%'
  },
  submissionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  submissionCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    background: '#fafafa'
  },
  submissionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  submissionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  participantName: {
    fontSize: '14px',
    color: '#666'
  },
  lateBadge: {
    background: '#ff5252',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  submissionDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  submissionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#888',
    marginBottom: '16px'
  },
  viewLink: {
    display: 'block',
    color: '#667eea',
    fontSize: '14px',
    marginBottom: '12px',
    textDecoration: 'none'
  },
  evaluateButton: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
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
  rankBadge: {
    padding: '6px 12px',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px'
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
    fontSize: '16px',
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
  }
};