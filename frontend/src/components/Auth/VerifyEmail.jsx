import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');
    
    console.log('Verification token:', token); // Debug log
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      setError('The verification link is missing the required token. Please check your email and try again.');
      return;
    }

    try {
      console.log('Sending verification request...'); // Debug log
      const response = await authAPI.verifyEmail(token);
      console.log('Verification response:', response); // Debug log
      
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      
      // Check if already verified
      if (error.response?.data?.alreadyVerified) {
        setStatus('already-verified');
        setMessage('Email Already Verified');
        setError('Your email has already been verified. You can login now.');
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Email verification failed');
        setError(error.response?.data?.message || 'The verification link may be invalid or expired. Please try registering again or contact support.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Verifying Email...</h2>
            <p style={styles.text}>Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Email Verified!</h2>
            <p style={styles.text}>{message}</p>
            <p style={styles.redirectText}>Redirecting to login in 3 seconds...</p>
            <Link to="/login" style={styles.button}>
              Go to Login Now
            </Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✗</div>
            <h2 style={styles.title}>Verification Failed</h2>
            <p style={styles.text}>{message}</p>
            {error && (
              <div style={styles.errorDetail}>
                {error}
              </div>
            )}
            <div style={styles.buttonGroup}>
              <Link to="/register" style={styles.button}>
                Register Again
              </Link>
              <Link to="/login" style={{...styles.button, ...styles.secondaryButton}}>
                Try Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '60px 40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
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
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#4caf50',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  errorIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#f44336',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333'
  },
  text: {
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6'
  },
  button: {
    display: 'inline-block',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '16px',
    margin: '0 8px'
  },
  secondaryButton: {
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  errorDetail: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#856404',
    lineHeight: '1.6',
    textAlign: 'left'
  },
  redirectText: {
    fontSize: '14px',
    color: '#666',
    marginTop: '12px',
    marginBottom: '8px'
  }
};