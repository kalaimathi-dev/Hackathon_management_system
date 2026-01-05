import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'judge') return '/judge/dashboard';
    return '/participant/dashboard';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to={getDashboardLink()} style={styles.brand}>
          🚀 Hackathon Management
        </Link>
        
        <div style={styles.menu}>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/admin/hackathons" style={styles.link}>Hackathons</Link>
              <Link to="/admin/tasks" style={styles.link}>Tasks</Link>
              <Link to="/admin/assignments" style={styles.link}>Assignments</Link>
              <Link to="/admin/participants" style={styles.link}>Participants</Link>
            </>
          )}
          
          {user?.role === 'judge' && (
            <Link to="/judge/dashboard" style={styles.link}>Evaluate</Link>
          )}
          
          {user?.role === 'participant' && (
            <>
              <Link to="/participant/dashboard" style={styles.link}>My Dashboard</Link>
              <Link to="/participant/hackathons" style={styles.link}>Browse Hackathons</Link>
            </>
          )}
          
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
          
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none'
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    opacity: 0.9,
    transition: 'opacity 0.3s'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: '12px'
  },
  userName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500'
  },
  userRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  logoutButton: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.3s'
  }
};