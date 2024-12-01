import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Grid
} from '@mui/material';
import { getInterviewByCode, saveCandidateInfo, subscribeToInterview, submitAnswer, completeInterview } from '../services/firebase';
import { CodeEditor } from './CodeEditor';
import ChatInterface from './ChatInterface';

const CandidateInterview = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interview, setInterview] = useState(null);
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    let unsubscribe;
    
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getInterviewByCode(code);
        if (!data) {
          throw new Error('Interview not found');
        }
        setInterview(data);
        
        unsubscribe = subscribeToInterview(code, (updatedData) => {
          if (!updatedData) {
            setError('Interview not found or has been deleted');
            return;
          }
          setInterview(updatedData);
        });
        
      } catch (err) {
        console.error('Error loading interview:', err);
        setError(err.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [code]);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (!candidate.name || !candidate.email) {
        setError('Please fill in all fields');
        return;
      }
      
      await saveCandidateInfo(interview.id, candidate);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await submitAnswer(interview.id, currentQuestionIndex, answer);
      
      setInterview(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestionIndex]: answer
        },
        evaluations: {
          ...prev.evaluations,
          [currentQuestionIndex]: result.evaluation
        },
        totalScore: result.totalScore
      }));

      setFeedback(result.evaluation);
      
      if (currentQuestionIndex === interview.questions.length - 1) {
        await completeInterview(interview.id);
        setShowChat(true);
      }

    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!interview) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Interview not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go Home
          </Button>
        </Box>
      </Container>
    );
  }

  // Show candidate info form if not started
  if (!interview.candidateInfo) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Technical Interview
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Position: {interview.position} | Level: {interview.level}
          </Typography>

          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleStartInterview}>
              <TextField
                fullWidth
                label="Your Name"
                value={candidate.name}
                onChange={(e) => setCandidate(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Your Email"
                type="email"
                value={candidate.email}
                onChange={(e) => setCandidate(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
                required
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                Start Interview
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Technical Interview - {interview.position}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Level: {interview.level} | Skills: {interview.skills?.join(', ')}
        </Typography>

        <Grid container spacing={3}>
          {/* Questions Section */}
          <Grid item xs={12} md={showChat ? 6 : 12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Stepper activeStep={currentQuestionIndex} sx={{ mb: 4 }}>
                {interview.questions.map((_, index) => (
                  <Step key={index}>
                    <StepLabel>Q{index + 1}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Typography variant="h6" gutterBottom>
                Question {currentQuestionIndex + 1} of {interview.questions.length}
              </Typography>
              <Typography variant="body1" paragraph>
                {currentQuestion.content}
              </Typography>

              {currentQuestion.type === 'coding' ? (
                <CodeEditor
                  value={answer}
                  onChange={setAnswer}
                  language="javascript"
                  disabled={submitting}
                />
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitting}
                  sx={{ mb: 2 }}
                />
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {error}
                </Alert>
              )}

              {feedback && (
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  Score: {feedback.score}/10
                  {feedback.feedback && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {feedback.feedback}
                    </Typography>
                  )}
                </Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => setAnswer('')}
                  disabled={!answer || submitting}
                >
                  Clear Answer
                </Button>
                
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => handleSubmitAnswer(answer)}
                    disabled={!answer || submitting}
                    sx={{ mr: 2 }}
                  >
                    Submit Answer
                  </Button>

                  {feedback && currentQuestionIndex < interview.questions.length - 1 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setAnswer('');
                        setFeedback(null);
                      }}
                    >
                      Next Question
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Chat Section */}
          {showChat && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Technical Discussion
                </Typography>
                <ChatInterface
                  question={{
                    content: `Let's discuss your experience and solutions. Feel free to ask questions as well.`,
                    type: 'chat',
                    maxScore: 10
                  }}
                  onSubmit={(message) => {
                    // Handle chat submission
                    console.log('Chat message:', message);
                  }}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default CandidateInterview;
