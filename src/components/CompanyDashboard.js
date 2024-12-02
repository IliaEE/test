import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch company data
        const companyRef = doc(db, 'companies', user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          const data = companySnap.data();
          setCompanyName(data.companyName || '');
        }

        // Fetch interviews
        const interviewsRef = collection(db, 'interviews');
        const q = query(interviewsRef, where('companyId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const interviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setInterviews(interviewsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopySuccess('Code copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleDeleteClick = (interview) => {
    setInterviewToDelete(interview);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete) return;

    try {
      await deleteDoc(doc(db, 'interviews', interviewToDelete.id));
      setInterviews(interviews.filter(interview => interview.id !== interviewToDelete.id));
      setDeleteDialogOpen(false);
      setInterviewToDelete(null);
    } catch (err) {
      console.error('Error deleting interview:', err);
      setError('Failed to delete interview. Please try again.');
    }
  };

  const isInterviewActive = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    return end >= today;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {companyName}!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Your Interviews
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/create-interview')}
            >
              Create New Interview
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {copySuccess}
          </Alert>
        )}

        <Grid container spacing={3}>
          {interviews.map((interview) => (
            <Grid item xs={12} md={6} lg={4} key={interview.id}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {interview.position}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Code: {interview.code}
                  </Typography>
                  <Tooltip title="Copy code">
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCode(interview.code)}
                      sx={{ ml: 1 }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  End Date: {format(new Date(interview.endDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={isInterviewActive(interview.endDate) ? "success.main" : "error.main"}
                  gutterBottom
                >
                  Status: {isInterviewActive(interview.endDate) ? 'Active' : 'Not Active'}
                </Typography>
                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/interview/${interview.id}/results`)}
                    sx={{ flex: 1 }}
                  >
                    View Results
                  </Button>
                  <IconButton 
                    color="error"
                    onClick={() => handleDeleteClick(interview)}
                    sx={{ border: 1, borderColor: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}

          {interviews.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No interviews created yet. Click "Create New Interview" to get started.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
      <Footer />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Interview</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this interview? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompanyDashboard;
