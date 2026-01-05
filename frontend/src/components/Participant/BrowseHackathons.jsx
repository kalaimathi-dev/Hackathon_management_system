import { useState, useEffect } from 'react';
import { hackathonAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BrowseHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const response = await hackathonAPI.getAll('active');
      console.log('Hackathons loaded:', response.data);
      setHackathons(response.data.data.hackathons || []);
    } catch (error) {
      console.error('Error loading hackathons:', error);
      showMessage('Failed to load hackathons', 'error');
      setHackathons([]);
    }
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleEnroll = async (hackathonId) => {
    try {
      const response = await hackathonAPI.enroll(hackathonId);
      showMessage(response.data.message || 'Enrolled successfully!', 'success');
      loadHackathons();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Enrollment failed', 'error');
    }
  };

  const isEnrolled = (hackathon) => {
    if (!hackathon.participants || !user) return false;
    return hackathon.participants.some(p => {
      const participantId = typeof p === 'object' ? p._id : p;
      return participantId === user.id;
    });
  };

  const isFull = (hackathon) => {
    return hackathon.participants?.length >= hackathon.maxParticipants;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading hackathons...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Browse Hackathons</h1>
      <p style={styles.subtitle}>Enroll in active hackathons to receive task assignments</p>

      {message && (
        <div style={messageType === 'success' ? styles.success : styles.error}>
          {message}
        </div>
      )}

      {hackathons.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No active hackathons available at the moment.</p>
          <p style={styles.emptySubtext}>Check back later for new hackathons!</p>
          <p style={styles.debugText}>
            Note: Make sure the admin has created hackathons with "Active" status.
          </p>
        </div>
      ) : (
        <div style={styles.hackathonGrid}>
          {hackathons.map(hackathon => {
            const enrolled = isEnrolled(hackathon);
            const full = isFull(hackathon);
            const participantCount = hackathon.participants?.length || 0;

            return (
              <div key={hackathon._id} style={styles.hackathonCard}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.hackathonTitle}>{hackathon.title}</h2>
                  {enrolled && (
                    <span style={styles.enrolledBadge}>✓ Enrolled</span>
                  )}
                  {!enrolled && full && (
                    <span style={styles.fullBadge}>Full</span>
                  )}
                </div>

                <p style={styles.description}>{hackathon.description}</p>

                <div style={styles.infoSection}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📅 Duration:</span>
                    <span style={styles.infoValue}>
                      {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📝 Assignment Window:</span>
                    <span style={styles.infoValue}>
                      {new Date(hackathon.assignmentStartDate).toLocaleDateString()} - {new Date(hackathon.assignmentEndDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>⏰ Submission Deadline:</span>
                    <span style={styles.infoValue}>
                      {new Date(hackathon.submissionDeadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>👥 Participants:</span>
                    <span style={styles.infoValue}>
                      {participantCount} / {hackathon.maxParticipants}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🎯 Tasks per participant:</span>
                    <span style={styles.infoValue}>
                      {hackathon.tasksPerParticipant}
                    </span>
                  </div>
                </div>

                {enrolled ? (
                  <button disabled style={styles.enrolledButton}>
                    Already Enrolled
                  </button>
                ) : full ? (
                  <button disabled style={styles.fullButton}>
                    Hackathon Full
                  </button>
                ) : (
                  <button 
                    onClick={() => handleEnroll(hackathon._id)}
                    style={styles.enrollButton}
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
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
    marginBottom: '8px',
    color: '#333'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px'
  },
  hackathonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  hackathonCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #f0f0f0',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  hackathonTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: '12px'
  },
  enrolledBadge: {
    padding: '6px 14px',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  fullBadge: {
    padding: '6px 14px',
    background: '#f8d7da',
    color: '#721c24',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  description: {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  infoLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
    textAlign: 'right'
  },
  enrollButton: {
    width: '100%',
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
  enrolledButton: {
    width: '100%',
    padding: '14px',
    background: '#d4edda',
    color: '#155724',
    border: '2px solid #c3e6cb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'not-allowed'
  },
  fullButton: {
    width: '100%',
    padding: '14px',
    background: '#f8d7da',
    color: '#721c24',
    border: '2px solid #f5c6cb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'not-allowed'
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
    padding: '80px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyText: {
    fontSize: '20px',
    color: '#666',
    marginBottom: '12px',
    fontWeight: '500'
  },
  emptySubtext: {
    fontSize: '16px',
    color: '#999'
  },
  debugText: {
    fontSize: '14px',
    color: '#666',
    marginTop: '20px',
    padding: '12px',
    background: '#f0f0f0',
    borderRadius: '6px'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666'
  }
};