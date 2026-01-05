import { useState, useEffect } from 'react';
import { assignmentAPI } from '../../services/api';

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await assignmentAPI.getMyAssignments();
      setAssignments(response.data.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
    setLoading(false);
  };

  const getFilteredAssignments = () => {
    if (filter === 'all') return assignments;
    return assignments.filter(a => a.status === filter);
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return <div style={styles.loading}>Loading your assignments...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Assignments</h1>

      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('all')}
          style={filter === 'all' ? styles.filterActive : styles.filterButton}
        >
          All ({assignments.length})
        </button>
        <button
          onClick={() => setFilter('assigned')}
          style={filter === 'assigned' ? styles.filterActive : styles.filterButton}
        >
          Pending ({assignments.filter(a => a.status === 'assigned').length})
        </button>
        <button
          onClick={() => setFilter('submitted')}
          style={filter === 'submitted' ? styles.filterActive : styles.filterButton}
        >
          Submitted ({assignments.filter(a => a.status === 'submitted').length})
        </button>
        <button
          onClick={() => setFilter('evaluated')}
          style={filter === 'evaluated' ? styles.filterActive : styles.filterButton}
        >
          Evaluated ({assignments.filter(a => a.status === 'evaluated').length})
        </button>
      </div>

      {filteredAssignments.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No {filter !== 'all' ? filter : ''} assignments found.</p>
        </div>
      ) : (
        <div style={styles.assignmentList}>
          {filteredAssignments.map(assignment => (
            <div key={assignment._id} style={styles.assignmentCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.assignmentTitle}>{assignment.taskId?.title}</h3>
                  <p style={styles.hackathonName}>{assignment.hackathonId?.title}</p>
                </div>
                <span style={getStatusBadge(assignment.status)}>
                  {assignment.status}
                </span>
              </div>

              <p style={styles.description}>{assignment.taskId?.description}</p>

              <div style={styles.metadata}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Difficulty:</span>
                  <span style={getDifficultyBadge(assignment.taskId?.difficulty)}>
                    {assignment.taskId?.difficulty}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Points:</span>
                  <span style={styles.metaValue}>💎 {assignment.taskId?.points}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Method:</span>
                  <span style={styles.metaValue}>{assignment.assignmentMethod}</span>
                </div>
              </div>

              <div style={styles.dates}>
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>Assigned:</span>
                  <span style={styles.dateValue}>
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>Deadline:</span>
                  <span style={styles.dateValue}>
                    {new Date(assignment.hackathonId?.submissionDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {assignment.taskId?.tags && assignment.taskId.tags.length > 0 && (
                <div style={styles.tags}>
                  {assignment.taskId.tags.map((tag, idx) => (
                    <span key={idx} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              {assignment.status === 'evaluated' && assignment.score !== undefined && (
                <div style={styles.evaluationBox}>
                  <div style={styles.scoreDisplay}>
                    <span style={styles.scoreLabel}>Score:</span>
                    <span style={styles.scoreValue}>{assignment.score}/100</span>
                  </div>
                  {assignment.remarks && (
                    <div style={styles.feedback}>
                      <strong>Feedback:</strong>
                      <p>{assignment.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const getStatusBadge = (status) => {
  const styles = {
    base: {
      padding: '6px 16px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    assigned: { background: '#fff3cd', color: '#856404' },
    submitted: { background: '#d1ecf1', color: '#0c5460' },
    evaluated: { background: '#d4edda', color: '#155724' },
    late: { background: '#f8d7da', color: '#721c24' }
  };
  return { ...styles.base, ...styles[status] };
};

const getDifficultyBadge = (difficulty) => {
  const colors = {
    easy: { background: '#d4edda', color: '#155724' },
    medium: { background: '#fff3cd', color: '#856404' },
    hard: { background: '#f8d7da', color: '#721c24' }
  };
  return {
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
    ...colors[difficulty]
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
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.3s'
  },
  filterActive: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    color: 'white'
  },
  assignmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  assignmentCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  assignmentTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px'
  },
  hackathonName: {
    fontSize: '14px',
    color: '#888'
  },
  description: {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  metadata: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  metaLabel: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '500'
  },
  metaValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500'
  },
  dates: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  dateItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dateLabel: {
    fontSize: '12px',
    color: '#888'
  },
  dateValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px'
  },
  tag: {
    padding: '6px 14px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  evaluationBox: {
    marginTop: '20px',
    padding: '16px',
    background: '#f0f8ff',
    borderRadius: '8px',
    border: '1px solid #d0e8ff'
  },
  scoreDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  scoreValue: {
    fontSize: '24px',
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  feedback: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    color: '#999',
    fontSize: '16px'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666'
  }
};