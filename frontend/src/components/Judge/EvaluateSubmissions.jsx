import { useState, useEffect } from 'react';
import { judgeAPI, hackathonAPI } from '../../services/api';

export default function EvaluateSubmissions() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [submissions, setSubmissions] = useState([]);
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
      loadPendingSubmissions();
    }
  }, [selectedHackathon]);

  const loadHackathons = async () => {
    try {
      const response = await hackathonAPI.getAll('active');
      setHackathons(response.data.data.hackathons);
    } catch (error) {
      console.error('Failed to load hackathons:', error);
    }
  };

  const loadPendingSubmissions = async () => {
    try {
      const response = await judgeAPI.getPending(selectedHackathon);
      setSubmissions(response.data.data.submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
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
      setSelectedSubmission(null);
      setEvaluationForm({ score: '', feedback: '' });
      loadPendingSubmissions();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Evaluation failed', 'error');
    }
    setLoading(false);
  };

  const openEvaluationForm = (submission) => {
    setSelectedSubmission(submission);
    setEvaluationForm({ score: '', feedback: '' });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Evaluate Submissions</h1>

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

      {selectedHackathon && !selectedSubmission && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            Pending Submissions ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <p style={styles.emptyState}>No pending submissions to evaluate.</p>
          ) : (
            <div style={styles.submissionList}>
              {submissions.map(submission => (
                <div key={submission._id} style={styles.submissionCard}>
                  <div style={styles.submissionHeader}>
                    <div>
                      <h3 style={styles.submissionTitle}>
                        {submission.taskId?.title}
                      </h3>
                      <p style={styles.participantName}>
                        by {submission.participantId?.name}
                      </p>
                      <p style={styles.email}>{submission.participantId?.email}</p>
                    </div>
                    {submission.isLate && (
                      <span style={styles.lateBadge}>Late Submission</span>
                    )}
                  </div>

                  <div style={styles.submissionBody}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Difficulty:</span>
                      <span style={getDifficultyBadge(submission.taskId?.difficulty)}>
                        {submission.taskId?.difficulty}
                      </span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Points:</span>
                      <span style={styles.infoValue}>
                        💎 {submission.taskId?.points}
                      </span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Submitted:</span>
                      <span style={styles.infoValue}>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={styles.descriptionBox}>
                    <strong style={styles.descLabel}>Participant's Description:</strong>
                    <p style={styles.descText}>{submission.description}</p>
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
                    onClick={() => openEvaluationForm(submission)}
                    style={styles.evaluateButton}
                  >
                    Evaluate This Submission
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSubmission && (
        <div style={styles.card}>
          <button
            onClick={() => setSelectedSubmission(null)}
            style={styles.backButton}
          >
            ← Back to List
          </button>
          
          <h2 style={styles.cardTitle}>Evaluate Submission</h2>
          
          <div style={styles.submissionInfo}>
            <h3 style={styles.infoTitle}>{selectedSubmission.taskId?.title}</h3>
            <p style={styles.infoSubtitle}>
              Submitted by {selectedSubmission.participantId?.name}
            </p>
            <a
              href={selectedSubmission.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkButton}
            >
              Open Submission URL →
            </a>
          </div>

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
                placeholder="Enter score between 0 and 100"
              />
              <div style={styles.scoreHelp}>
                <span>0 = Poor</span>
                <span>50 = Average</span>
                <span>100 = Excellent</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Feedback (Optional)</label>
              <textarea
                value={evaluationForm.feedback}
                onChange={(e) => setEvaluationForm({...evaluationForm, feedback: e.target.value})}
                rows={6}
                style={{...styles.input, resize: 'vertical'}}
                placeholder="Provide constructive feedback to help the participant improve..."
              />
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? 'Submitting Evaluation...' : 'Submit Evaluation'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
    ...colors[difficulty]
  };
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1000px',
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
  submissionList: {
    display: 'flex',
    flexDirection: 'column',
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
    marginBottom: '16px'
  },
  submissionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px'
  },
  participantName: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '2px'
  },
  email: {
    fontSize: '13px',
    color: '#888'
  },
  lateBadge: {
    padding: '6px 14px',
    background: '#f44336',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  submissionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  infoLabel: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '500',
    minWidth: '80px'
  },
  infoValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500'
  },
  descriptionBox: {
    marginBottom: '16px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  descLabel: {
    fontSize: '13px',
    color: '#666',
    display: 'block',
    marginBottom: '8px'
  },
  descText: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6'
  },
  viewLink: {
    display: 'inline-block',
    color: '#667eea',
    fontSize: '14px',
    marginBottom: '16px',
    textDecoration: 'none',
    fontWeight: '500'
  },
  evaluateButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  backButton: {
    padding: '8px 16px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  submissionInfo: {
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px'
  },
  infoSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px'
  },
  linkButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#2196F3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  scoreHelp: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#888',
    marginTop: '4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  submitButton: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
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