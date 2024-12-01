import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Button, 
  TextField, 
  Typography,
  Alert 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const LandingPage = () => {
  const navigate = useNavigate();
  const [interviewCode, setInterviewCode] = useState('');
  const [error, setError] = useState('');

  const handleStartInterview = () => {
    if (!interviewCode.trim()) {
      setError('Please enter an interview code');
      return;
    }
    setError('');
    navigate(`/interview/${interviewCode.trim()}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #EEF2FF, #FFFFFF)',
        pt: { xs: 8, sm: 12 },
        pb: { xs: 8, sm: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '800px',
            mx: 'auto',
            px: 3,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem' },
              fontWeight: 700,
              color: '#111827',
              mb: 4,
            }}
          >
            AI-Powered Technical Interviews
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: '#6B7280',
              mb: 6,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              lineHeight: 1.6,
            }}
          >
            Streamline your technical interviews with AI-powered assessments.
            Get deeper insights into candidates' abilities and make data-driven hiring decisions.
          </Typography>

          <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              Get Started
              <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
            </Button>

            <Box sx={{ mt: 4, width: '100%', maxWidth: '400px' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#111827' }}>
                Have an interview code?
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter your interview code"
                  value={interviewCode}
                  onChange={(e) => setInterviewCode(e.target.value)}
                  error={!!error}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleStartInterview}
                >
                  Start Interview
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;