import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hackathonAPI, taskAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalHackathons: 0,
    activeHackathons: 0,
    totalTasks: 0
  });
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await hackathonAPI.getAll();
      const hackathons = response.data.data.hackathons;
      setHackathons(hackathons);
      
      setStats({
        totalHackathons: hackathons.length,
        activeHackathons: hackathons.filter(h => h.status === 'active').length,
        totalTasks: 0
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalHackathons}</div>
          <div style={styles.statLabel}>Total Hackathons</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.activeHackathons}</div>
          <div style={styles.statLabel}>Active Hackathons</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalTasks}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
      </div>

      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionGrid}>
          <Link to="/admin/assignments" style={{...styles.actionCard, textDecoration: 'none'}}>
            <div style={styles.actionIcon}>📋</div>
            <h3 style={styles.actionTitle}>Manage Assignments</h3>
            <p style={styles.actionDesc}>Assign tasks to participants</p>
          </Link>
          
          <Link to="/admin/hackathons" style={{...styles.actionCard, textDecoration: 'none'}}>
            <div style={styles.actionIcon}>🎯</div>
            <h3 style={styles.actionTitle}>Create Hackathon</h3>
            <p style={styles.actionDesc}>Set up new hackathon event</p>
          </Link>
          
          <Link to="/admin/tasks" style={{...styles.actionCard, textDecoration: 'none'}}>
            <div style={styles.actionIcon}>📝</div>
            <h3 style={styles.actionTitle}>Create Tasks</h3>
            <p style={styles.actionDesc}>Add new challenges</p>
          </Link>
          
          <Link to="/admin/participants" style={{...styles.actionCard, textDecoration: 'none'}}>
            <div style={styles.actionIcon}>👥</div>
            <h3 style={styles.actionTitle}>View Participants</h3>
            <p style={styles.actionDesc}>Manage participant list</p>
          </Link>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Recent Hackathons</h2>
        {hackathons.length === 0 ? (
          <p style={styles.emptyState}>No hackathons created yet.</p>
        ) : (
          <div style={styles.hackathonList}>
            {hackathons.slice(0, 5).map(hackathon => (
              <div key={hackathon._id} style={styles.hackathonItem}>
                <div style={styles.hackathonInfo}>
                  <h3 style={styles.hackathonTitle}>{hackathon.title}</h3>
                  <p style={styles.hackathonDesc}>{hackathon.description}</p>
                  <div style={styles.hackathonMeta}>
                    <span>📅 {new Date(hackathon.startDate).toLocaleDateString()}</span>
                    <span>👥 {hackathon.participants?.length || 0} participants</span>
                  </div>
                </div>
                <div style={styles.hackathonStatus}>
                  <span style={getStatusBadge(hackathon.status)}>
                    {hackathon.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusBadge = (status) => {
  const styles = {
    base: {
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    active: { background: '#d4edda', color: '#155724' },
    draft: { background: '#fff3cd', color: '#856404' },
    completed: { background: '#d1ecf1', color: '#0c5460' },
    cancelled: { background: '#f8d7da', color: '#721c24' }
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
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  quickActions: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px'
  },
  actionCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    display: 'block'
  },
  actionIcon: {
    fontSize: '40px',
    marginBottom: '12px'
  },
  actionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333'
  },
  actionDesc: {
    fontSize: '13px',
    color: '#666'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333'
  },
  hackathonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  hackathonItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    background: '#fafafa'
  },
  hackathonInfo: {
    flex: 1
  },
  hackathonTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#333'
  },
  hackathonDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px'
  },
  hackathonMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#888'
  },
  hackathonStatus: {
    marginLeft: '20px'
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