import { useState, useEffect } from 'react';
import { hackathonAPI, assignmentAPI } from '../../services/api';

export default function ParticipantList() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      loadParticipants();
      loadAssignments();
    }
  }, [selectedHackathon]);

  const loadHackathons = async () => {
    try {
      const response = await hackathonAPI.getAll();
      setHackathons(response.data.data.hackathons);
    } catch (error) {
      console.error('Failed to load hackathons:', error);
    }
  };

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const response = await hackathonAPI.getById(selectedHackathon);
      setParticipants(response.data.data.hackathon.participants || []);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
    setLoading(false);
  };

  const loadAssignments = async () => {
    try {
      const response = await assignmentAPI.getByHackathon(selectedHackathon);
      setAssignments(response.data.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const getParticipantAssignments = (participantId) => {
    return assignments.filter(a => a.participantId._id === participantId);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Participant Management</h1>

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
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            Participants ({participants.length})
          </h2>
          {loading ? (
            <p style={styles.loading}>Loading participants...</p>
          ) : participants.length === 0 ? (
            <p style={styles.emptyState}>No participants enrolled yet.</p>
          ) : (
            <div style={styles.participantGrid}>
              {participants.map(participant => {
                const userAssignments = getParticipantAssignments(participant._id);
                const submittedCount = userAssignments.filter(a => a.status === 'submitted').length;
                const evaluatedCount = userAssignments.filter(a => a.status === 'evaluated').length;

                return (
                  <div key={participant._id} style={styles.participantCard}>
                    <div style={styles.participantHeader}>
                      <div style={styles.avatar}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.participantInfo}>
                        <h3 style={styles.participantName}>{participant.name}</h3>
                        <p style={styles.participantEmail}>{participant.email}</p>
                        <p style={styles.participantId}>ID: {participant._id}</p>
                      </div>
                    </div>

                    {participant.skills && participant.skills.length > 0 && (
                      <div style={styles.skillsSection}>
                        <strong style={styles.skillsLabel}>Skills:</strong>
                        <div style={styles.skills}>
                          {participant.skills.map((skill, idx) => (
                            <span key={idx} style={styles.skill}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={styles.statsSection}>
                      <div style={styles.stat}>
                        <div style={styles.statNumber}>{userAssignments.length}</div>
                        <div style={styles.statLabel}>Assigned</div>
                      </div>
                      <div style={styles.stat}>
                        <div style={styles.statNumber}>{submittedCount}</div>
                        <div style={styles.statLabel}>Submitted</div>
                      </div>
                      <div style={styles.stat}>
                        <div style={styles.statNumber}>{evaluatedCount}</div>
                        <div style={styles.statLabel}>Evaluated</div>
                      </div>
                    </div>

                    {userAssignments.length > 0 && (
                      <div style={styles.assignmentsList}>
                        <strong style={styles.assignmentsLabel}>Assignments:</strong>
                        {userAssignments.map(assignment => (
                          <div key={assignment._id} style={styles.assignmentItem}>
                            <span style={styles.taskName}>{assignment.taskId?.title}</span>
                            <span style={getStatusBadge(assignment.status)}>
                              {assignment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const getStatusBadge = (status) => {
  const styles = {
    base: {
      padding: '3px 10px',
      borderRadius: '10px',
      fontSize: '11px',
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
  participantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  participantCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    background: '#fafafa'
  },
  participantHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
    marginRight: '16px',
    flexShrink: 0
  },
  participantInfo: {
    flex: 1,
    minWidth: 0
  },
  participantName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  participantEmail: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px',
    wordBreak: 'break-word'
  },
  participantId: {
    fontSize: '11px',
    color: '#999',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  skillsSection: {
    marginBottom: '16px'
  },
  skillsLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
    display: 'block'
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  skill: {
    padding: '4px 10px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  assignmentsList: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0'
  },
  assignmentsLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '10px',
    display: 'block'
  },
  assignmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '13px'
  },
  taskName: {
    color: '#333',
    flex: 1,
    marginRight: '12px'
  },
  loading: {
    textAlign: 'center',
    padding: '30px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '15px'
  }
};