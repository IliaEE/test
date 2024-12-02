import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthNavbar } from './auth/AuthNavbar';
import { Footer } from './landing/Footer';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('company');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    interviewCode: '',
    candidateName: '',
    candidateEmail: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleTabChange = (event, newValue) => {
    setLoginType(newValue);
    setError('');
    setSuccessMessage('');
    setFormData({
      email: '',
      password: '',
      interviewCode: '',
      candidateName: '',
      candidateEmail: '',
    });
    setShowPersonalInfo(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      
      // Configure actionCodeSettings
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true
      };

      console.log('Attempting to send password reset email to:', resetEmail);
      
      // Send password reset email
      await sendPasswordResetEmail(
        auth,
        resetEmail.trim(),
        actionCodeSettings
      );

      console.log('Password reset email sent successfully');
      setSuccessMessage('Password reset email sent! Please check your inbox and spam folder.');
      setResetPasswordOpen(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset error details:', {
        code: err.code,
        message: err.message,
        email: resetEmail
      });

      // Handle specific error cases
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address. Please check the email or register a new account.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setError(`Error sending reset email: ${err.message}`);
      }
    }
  };

  const handleCompanyLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/company-dashboard');  
    } catch (err) {
      console.error('Login error:', err);
      setError('Incorrect email or password');
    }
  };

  const handleCandidateCodeVerification = async (e) => {
    e.preventDefault();
    if (!formData.interviewCode) {
      setError('Please enter interview code');
      return;
    }
    
    try {
      // Check if interview exists and is active
      const interviewsRef = collection(db, 'interviews');
      const q = query(interviewsRef, where('code', '==', formData.interviewCode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Incorrect code or vacancy is out of date');
        return;
      }

      const interview = querySnapshot.docs[0].data();
      const isActive = new Date(interview.endDate) >= new Date();
      
      if (!isActive) {
        setError('Incorrect code or vacancy is out of date');
        return;
      }

      // Check if candidate has already taken this interview
      const candidatesRef = collection(db, 'interviews', querySnapshot.docs[0].id, 'candidates');
      const candidateQuery = query(
        candidatesRef, 
        where('email', '==', formData.candidateEmail),
        where('name', '==', formData.candidateName)
      );
      const candidateSnapshot = await getDocs(candidateQuery);

      if (!candidateSnapshot.empty) {
        setError(`You have already passed the interview, your answers have been sent to the company ${interview.companyName}`);
        return;
      }

      setShowPersonalInfo(true);
      setError('');
    } catch (err) {
      console.error('Code verification error:', err);
      setError('Failed to verify interview code');
    }
  };

  const handleCandidateLogin = async (e) => {
    e.preventDefault();
    if (!formData.interviewCode || !formData.candidateName || !formData.candidateEmail) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      // Store candidate info in session storage
      sessionStorage.setItem('candidateInfo', JSON.stringify({
        name: formData.candidateName,
        email: formData.candidateEmail,
        interviewCode: formData.interviewCode
      }));
      
      navigate(`/candidate-interview/${formData.interviewCode}`);
    } catch (err) {
      console.error('Candidate login error:', err);
      setError('Failed to start interview. Please check your interview code.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuthNavbar />
      <Container component="main" maxWidth="xs" sx={{ flex: 1, my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {loginType === 'company' ? 'Company Login' : 'Start Interview'}
          </Typography>

          <Tabs value={loginType} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Company" value="company" />
            <Tab label="Candidate" value="candidate" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {loginType === 'company' ? (
            <Box component="form" onSubmit={handleCompanyLogin} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button
                  onClick={() => setResetPasswordOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Forgot password?
                </Button>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button sx={{ textTransform: 'none' }}>
                    Register as a new company
                  </Button>
                </Link>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={showPersonalInfo ? handleCandidateLogin : handleCandidateCodeVerification} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="interviewCode"
                label="Interview Code"
                name="interviewCode"
                autoFocus
                value={formData.interviewCode}
                onChange={handleInputChange}
                disabled={showPersonalInfo}
              />
              
              {showPersonalInfo && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="candidateName"
                    label="Your Name"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="candidateEmail"
                    label="Your Email"
                    name="candidateEmail"
                    type="email"
                    value={formData.candidateEmail}
                    onChange={handleInputChange}
                  />
                </>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                {showPersonalInfo ? 'Start Interview' : 'Verify Code'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
      <Footer />

      {/* Password Reset Dialog */}
      <Dialog 
        open={resetPasswordOpen} 
        onClose={() => {
          setResetPasswordOpen(false);
          setError('');
          setSuccessMessage('');
          setResetEmail('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="resetEmail"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            error={!!error}
            helperText={error ? ' ' : ''}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setResetPasswordOpen(false);
              setError('');
              setSuccessMessage('');
              setResetEmail('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetPassword}
            variant="contained"
            disabled={!resetEmail}
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
