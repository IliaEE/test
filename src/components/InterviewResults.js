import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { Navbar } from './landing/Navbar';
import { Footer } from './landing/Footer';

const InterviewResults = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { db, auth } = useFirebase();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError(null);

        const interviewRef = doc(db, 'interviews', interviewId);
        const interviewSnap = await getDoc(interviewRef);

        if (!interviewSnap.exists()) {
          setError('Interview not found');
          return;
        }

        const interviewData = {
          id: interviewSnap.id,
          ...interviewSnap.data()
        };

        // Check if the user has permission to view these results
        if (interviewData.companyId !== auth.currentUser?.uid) {
          setError('You do not have permission to view these results');
          return;
        }

        setInterview(interviewData);
      } catch (err) {
        console.error('Error loading interview results:', err);
        setError('Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };

    if (interviewId && auth.currentUser) {
      loadInterview();
    }
  }, [db, interviewId, auth.currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <Container sx={{ py: 8, minHeight: 'calc(100vh - 136px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <Container sx={{ py: 8, minHeight: 'calc(100vh - 136px)' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/company/dashboard')}>
            Back to Dashboard
          </Button>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container sx={{ py: 8, minHeight: 'calc(100vh - 136px)' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Interview Results
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/company/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        {interview && (
          <>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {interview.position}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Level: {interview.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Code: {interview.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available until: {new Date(interview.endDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Chip 
                label={new Date(interview.endDate) >= new Date() ? "Active" : "Inactive"} 
                color={new Date(interview.endDate) >= new Date() ? "success" : "error"}
                size="small"
              />
            </Paper>

            {interview.candidates?.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Completion Date</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interview.candidates.map((candidate, index) => (
                      <TableRow key={index}>
                        <TableCell>{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>
                          {candidate.completedAt ? new Date(candidate.completedAt).toLocaleString() : 'In Progress'}
                        </TableCell>
                        <TableCell>
                          {candidate.score ? `${candidate.score}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={candidate.status || 'In Progress'}
                            color={
                              candidate.status === 'passed' ? 'success' :
                              candidate.status === 'failed' ? 'error' :
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/interview/${interviewId}/candidate/${index}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No candidates have taken this interview yet
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default InterviewResults;
