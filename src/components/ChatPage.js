import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import { getInterviewByCode } from '../services/firebase';
import ChatInterface from './ChatInterface';

const ChatPage = () => {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getInterviewByCode(code);
        if (!data) {
          throw new Error('Interview not found');
        }
        setInterview(data);
      } catch (err) {
        console.error('Error loading interview:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [code]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  const currentQuestion = {
    content: "Let's discuss your experience and qualifications. Feel free to ask any questions about the position.",
    type: 'chat',
    maxScore: 10
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Technical Interview Chat
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Position: {interview?.position}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Level: {interview?.level} | Skills: {interview?.skills?.join(', ')}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <ChatInterface
              question={currentQuestion}
              onSubmit={async (message, evaluation) => {
                console.log('Message:', message);
                console.log('Evaluation:', evaluation);
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatPage;
