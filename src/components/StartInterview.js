import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const StartInterview = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const interviewsRef = collection(db, 'interviews');
      const q = query(interviewsRef, where('code', '==', code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid interview code. Please check and try again.');
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      console.error('Error verifying interview code:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    
    if (!candidateInfo.name.trim() || !candidateInfo.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateInfo.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Store candidate info in session storage
    sessionStorage.setItem('candidateInfo', JSON.stringify(candidateInfo));

    // Navigate to interview
    navigate(`/interview/${code}`);
  };

  if (step === 2) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Candidate Information
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Please provide your details before starting the interview
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleInfoSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={candidateInfo.name}
              onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={candidateInfo.email}
              onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
              required
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!candidateInfo.name.trim() || !candidateInfo.email.trim()}
              >
                Start Interview
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Start Interview
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Enter your interview code to begin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleCodeSubmit}>
          <TextField
            fullWidth
            label="Interview Code"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mb: 3 }}
            required
          />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !code.trim()}
            >
              Verify Code
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default StartInterview;
