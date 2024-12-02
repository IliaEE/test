import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  TableSortLabel,
  Link,
} from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const InterviewResults = () => {
  const { interviewId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Get interview data
        const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
        if (!interviewDoc.exists()) {
          setError('Interview not found');
          return;
        }
        setInterview(interviewDoc.data());

        // Get candidates results
        const candidatesRef = collection(db, 'interviews', interviewId, 'candidates');
        const candidatesSnapshot = await getDocs(candidatesRef);
        const candidatesData = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by score (highest first)
        candidatesData.sort((a, b) => b.score - a.score);
        setCandidates(candidatesData);
        
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [interviewId]);

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sortedCandidates = [...candidates].sort((a, b) => {
      return newOrder === 'asc' ? a.score - b.score : b.score - a.score;
    });
    setCandidates(sortedCandidates);
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
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Interview Results
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Position: {interview.position} | Level: {interview.level}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={true}
                    direction={sortOrder}
                    onClick={handleSort}
                  >
                    Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>
                    <Link 
                      href={`mailto:${candidate.email}`}
                      underline="hover"
                      color="primary"
                    >
                      {candidate.email}
                    </Link>
                  </TableCell>
                  <TableCell>{candidate.score}%</TableCell>
                  <TableCell>
                    {new Date(candidate.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No candidates have completed this interview yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default InterviewResults;
