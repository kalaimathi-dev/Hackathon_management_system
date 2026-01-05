import { useState } from 'react';
import { submissionAPI } from '../../services/api';

export default function SubmitTask({ assignment, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    submissionUrl: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await submissionAPI.create({
        assignmentId: assignment._id,
        ...formData
      });
      onSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Submit Solution</h2>
      <h3 style={styles.taskTitle}>{assignment.taskId?.title}</h3>
      <p style={styles.taskDesc}>{assignment.taskId?.description}</p>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Submission URL * 
            <span style={styles.hint}>(GitHub, GitLab, or any public URL)</span>
          </label>
          <input
            type="url"
            value={formData.submissionUrl}
            onChange={(e) => setFormData({...formData, submissionUrl: e.target.value})}
            required
            placeholder="https://github.com/username/repo"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Description *
            <span style={styles.hint}>(Explain your approach and solution)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows={6}
            placeholder="Describe your solution, technologies used, challenges faced, etc."
            style={{...styles.input, resize: 'vertical'}}
          />
        </div>

        <div style={styles.info}>
          <p style={styles.infoText}>
            ⚠️ You can submit multiple times. Only your latest submission will be evaluated.
          </p>
          <p style={styles.infoText}>
            📅 Deadline: {new Date(assignment.hackathonId?.submissionDeadline).toLocaleString()}
          </p>
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Submitting...' : 'Submit Solution'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '700px',
    margin: '0 auto'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333'
  },
  taskTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#667eea',
    marginBottom: '8px'
  },
  taskDesc: {
    fontSize: '15px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  hint: {
    fontSize: '12px',
    fontWeight: '400',
    color: '#888'
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  info: {
    background: '#f0f8ff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #d0e8ff'
  },
  infoText: {
    fontSize: '13px',
    color: '#666',
    margin: '6px 0'
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
    cursor: 'pointer',
    transition: 'transform 0.2s'
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
  error: {
    background: '#fee',
    color: '#c33',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  }
};