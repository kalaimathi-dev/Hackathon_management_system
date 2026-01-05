import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JudgeManager() {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJudges();
  }, []);

  const loadJudges = async () => {
    setLoading(true);
    try {
      // This requires a new backend endpoint or we query users with role=judge
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/users?role=judge', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJudges(response.data.data.users || []);
    } catch (error) {
      console.error('Error loading judges:', error);
      setJudges([]);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading judges...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Judge Management</h1>
      
      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>How to Add Judges:</h3>
        <ol style={styles.infoList}>
          <li>User registers with role "Judge"</li>
          <li>User verifies their email</li>
          <li>They can then login and evaluate submissions</li>
        </ol>
        <p style={styles.infoNote}>
          <strong>Quick Test:</strong> Open incognito window → Register with role "Judge" → Verify email → Login
        </p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Current Judges ({judges.length})</h2>
        {judges.length === 0 ? (
          <p style={styles.emptyState}>No judges registered yet. They can register at the registration page.</p>
        ) : (
          <div style={styles.judgeGrid}>
            {judges.map(judge => (
              <div key={judge._id} style={styles.judgeCard}>
                <div style={styles.avatar}>
                  {judge.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.judgeInfo}>
                  <h3 style={styles.judgeName}>{judge.name}</h3>
                  <p style={styles.judgeEmail}>{judge.email}</p>
                  <p style={styles.judgeStatus}>
                    {judge.isEmailVerified ? 
                      <span style={styles.verified}>✓ Verified</span> : 
                      <span style={styles.unverified}>✗ Not Verified</span>
                    }
                  </p>
                  <p style={styles.judgeId}>ID: {judge._id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.testCard}>
        <h3 style={styles.testTitle}>🧪 Quick Test Instructions</h3>
        <div style={styles.testSteps}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepContent}>
              <strong>Open Incognito Window</strong>
              <p>Press Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)</p>
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepContent}>
              <strong>Register as Judge</strong>
              <p>Go to: http://localhost:5173/register</p>
              <p>Email: judge@test.com, Role: Judge</p>
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepContent}>
              <strong>Verify Email</strong>
              <p>Check backend console for token, then visit verification link</p>
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>4</div>
            <div style={styles.stepContent}>
              <strong>Login & Test</strong>
              <p>Login with judge credentials, access judge dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  infoBox: {
    background: '#e3f2fd',
    border: '2px solid #2196F3',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: '16px'
  },
  infoList: {
    marginLeft: '20px',
    marginBottom: '16px',
    color: '#333',
    lineHeight: '1.8'
  },
  infoNote: {
    fontSize: '14px',
    color: '#1565c0',
    background: 'white',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '16px'
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
  judgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  judgeCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    background: '#fafafa'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginRight: '16px',
    flexShrink: 0
  },
  judgeInfo: {
    flex: 1
  },
  judgeName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  judgeEmail: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '6px'
  },
  judgeStatus: {
    fontSize: '13px',
    marginBottom: '6px'
  },
  verified: {
    color: '#4caf50',
    fontWeight: '500'
  },
  unverified: {
    color: '#f44336',
    fontWeight: '500'
  },
  judgeId: {
    fontSize: '11px',
    color: '#999',
    fontFamily: 'monospace'
  },
  testCard: {
    background: '#f3e5f5',
    border: '2px solid #9c27b0',
    borderRadius: '12px',
    padding: '24px'
  },
  testTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#6a1b9a',
    marginBottom: '24px'
  },
  testSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    background: 'white',
    padding: '16px',
    borderRadius: '8px'
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#9c27b0',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0
  },
  stepContent: {
    flex: 1
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '15px'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666'
  }
};