import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonAPI } from '../../services/api';

export default function PublicRegistration() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: ''
  });

  useEffect(() => {
    loadHackathon();
  }, [code]);

  const loadHackathon = async () => {
    try {
      setLoading(true);
      const response = await hackathonAPI.getByCode(code);
      setHackathon(response.data.data.hackathon);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid registration link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await hackathonAPI.registerViaLink(code, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skills: skillsArray
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (error && !hackathon) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Invalid Link</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => navigate('/login')} style={styles.homeButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Registration Successful!</h2>
          <p style={styles.successText}>
            You've been registered for {hackathon?.title}
          </p>
          <p style={styles.redirectText}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!hackathon?.isRegistrationOpen) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>🔒</div>
          <h2 style={styles.errorTitle}>Registration Closed</h2>
          <p style={styles.errorText}>
            Registration for this hackathon is no longer available.
          </p>
          {hackathon?.status === 'completed' && (
            <p style={styles.errorText}>This hackathon has been completed.</p>
          )}
          {hackathon?.currentParticipants >= hackathon?.maxParticipants && (
            <p style={styles.errorText}>Maximum participant limit reached.</p>
          )}
          <button onClick={() => navigate('/login')} style={styles.homeButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.hackathonInfo}>
          <h1 style={styles.hackathonTitle}>{hackathon.title}</h1>
          <p style={styles.hackathonDesc}>{hackathon.description}</p>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📅 Start Date</span>
              <span style={styles.infoValue}>
                {new Date(hackathon.startDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📅 End Date</span>
              <span style={styles.infoValue}>
                {new Date(hackathon.endDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>👥 Participants</span>
              <span style={styles.infoValue}>
                {hackathon.currentParticipants} / {hackathon.maxParticipants}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>⏰ Submission Deadline</span>
              <span style={styles.infoValue}>
                {new Date(hackathon.submissionDeadline).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h2 style={styles.formTitle}>Register for this Hackathon</h2>
          
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={styles.input}
                placeholder="John Doe"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={styles.input}
                placeholder="john@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password * (min 6 characters)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                style={styles.input}
                placeholder="React, Node.js, Python, UI/UX"
              />
              <span style={styles.hint}>Enter your skills separated by commas</span>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={styles.submitButton}
            >
              {submitting ? 'Registering...' : 'Register Now'}
            </button>

            <p style={styles.loginLink}>
              Already have an account? <a href="/login" style={styles.link}>Login here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    maxWidth: '800px',
    width: '100%',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  loadingCard: {
    maxWidth: '400px',
    width: '100%',
    background: 'white',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666'
  },
  errorCard: {
    maxWidth: '400px',
    width: '100%',
    background: 'white',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px'
  },
  errorText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  homeButton: {
    marginTop: '24px',
    padding: '12px 32px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  successCard: {
    maxWidth: '400px',
    width: '100%',
    background: 'white',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    background: '#4CAF50',
    color: 'white',
    fontSize: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px'
  },
  successText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px'
  },
  redirectText: {
    fontSize: '14px',
    color: '#999',
    marginTop: '16px'
  },
  hackathonInfo: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px',
    color: 'white'
  },
  hackathonTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px'
  },
  hackathonDesc: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '32px',
    opacity: 0.95
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  infoLabel: {
    fontSize: '13px',
    opacity: 0.9
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: '600'
  },
  formSection: {
    padding: '40px'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '24px'
  },
  errorMessage: {
    background: '#fee',
    color: '#c33',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #fcc'
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
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border-color 0.2s'
  },
  hint: {
    fontSize: '12px',
    color: '#999'
  },
  submitButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'transform 0.2s'
  },
  loginLink: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500'
  }
};