import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import Navbar from './components/Shared/Navbar';
import AdminDashboard from './components/Admin/AdminDashboard';
import HackathonManager from './components/Admin/HackathonManager';
import TaskManager from './components/Admin/TaskManager';
import AssignmentManager from './components/Admin/AssignmentManager';
import ParticipantList from './components/Admin/ParticipantList';
import ParticipantDashboard from './components/Participant/ParticipantDashboard';
import BrowseHackathons from './components/Participant/BrowseHackathons';
import JudgeDashboard from './components/Judge/JudgeDashboard';

function getDefaultRoute() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'judge') return '/judge/dashboard';
  return '/participant/dashboard';
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }
  
  if (!user) {
    // Save the attempted URL to redirect back after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }
  
  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/hackathons" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <HackathonManager />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/tasks" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TaskManager />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/assignments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AssignmentManager />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/participants" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ParticipantList />
          </ProtectedRoute>
        } />
        
        <Route path="/participant/dashboard" element={
          <ProtectedRoute allowedRoles={['participant']}>
            <ParticipantDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/participant/hackathons" element={
          <ProtectedRoute allowedRoles={['participant']}>
            <BrowseHackathons />
          </ProtectedRoute>
        } />
        
        <Route path="/judge/dashboard" element={
          <ProtectedRoute allowedRoles={['judge', 'admin']}>
            <JudgeDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/unauthorized" element={
          <div style={styles.unauthorized}>
            <h1>Unauthorized Access</h1>
            <p>You don't have permission to view this page.</p>
          </div>
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/login" replace />
        } />
        
        <Route path="*" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666'
  },
  unauthorized: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px'
  }
};