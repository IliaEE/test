import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Fade
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Plus as PlusIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Trash2 as Trash2Icon,
} from 'lucide-react';
import { createInterview, getCompanyInterviews, deleteInterview } from '../services/firebaseService';
import { useFirebase } from '../contexts/FirebaseContext';
import { Navbar } from './landing/Navbar';
import { Footer } from './landing/Footer';

const SKILLS_CONFIG = {
  javascript: { label: 'JavaScript', checked: false },
  python: { label: 'Python', checked: false },
  react: { label: 'React', checked: false },
  node: { label: 'Node.js', checked: false },
  testing: { label: 'Testing', checked: false }
};

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { db, auth } = useFirebase();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newInterview, setNewInterview] = useState({
    position: '',
    description: '',
    level: 'Middle',
    endDate: null,
    skills: []
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        if (!auth.currentUser) return;
        
        const companyRef = doc(db, 'companies', auth.currentUser.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          setCompanyData(companySnap.data());
        } else {
          setError('Company not found');
        }
      } catch (err) {
        setError('Error loading company data: ' + err.message);
      }
    };

    const loadInterviews = async () => {
      try {
        if (!auth.currentUser) return;
        const data = await getCompanyInterviews(db, auth.currentUser.uid);
        setInterviews(data);
      } catch (err) {
        setError('Error loading interviews: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (db && auth.currentUser) {
      loadCompanyData();
      loadInterviews();
    }
  }, [db, auth.currentUser]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = await getCompanyInterviews(db, auth.currentUser.uid);
      setInterviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!newInterview.position || !newInterview.description || !newInterview.level || !newInterview.endDate) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const selectedSkills = Object.entries(SKILLS_CONFIG)
        .filter(([key, value]) => value.checked)
        .map(([key]) => key);

      const interviewData = {
        position: newInterview.position,
        description: newInterview.description,
        level: newInterview.level,
        endDate: newInterview.endDate.toISOString(),
        skills: selectedSkills,
        companyId: auth.currentUser.uid,
        questions: [],
        answers: {},
        evaluations: {},
        status: 'pending'
      };

      await createInterview(db, interviewData);
      
      // Reset form and SKILLS_CONFIG
      Object.keys(SKILLS_CONFIG).forEach(key => {
        SKILLS_CONFIG[key].checked = false;
      });
      
      setNewInterview({
        position: '',
        description: '',
        level: 'Middle',
        endDate: null,
        skills: []
      });
      
      // Close dialog
      setCreateDialogOpen(false);
      
      // Refresh interviews list
      fetchInterviews();
    } catch (err) {
      console.error('Error creating interview:', err);
      setError(err.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (interview) => {
    setInterviewToDelete(interview);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete) return;
    
    try {
      setLoading(true);
      await deleteInterview(db, interviewToDelete.id);
      await fetchInterviews();
    } catch (err) {
      console.error('Error deleting interview:', err);
      setError('Failed to delete interview');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setInterviewToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInterviewToDelete(null);
  };

  const handleSkillChange = (key, checked) => {
    SKILLS_CONFIG[key].checked = checked;
    setNewInterview(prev => ({ ...prev }));
  };

  const isInterviewActive = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    return end >= now;
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Container maxWidth="lg" sx={{ 
        py: 8,
        minHeight: 'calc(100vh - 136px)'
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {companyData?.name || 'Company Dashboard'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Interview
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {interviews.map((interview) => {
              const isActive = isInterviewActive(interview.endDate);
              const isCopied = copiedCode === interview.code;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={interview.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {interview.position}
                        </Typography>
                        <Chip 
                          label={isActive ? "Active" : "Inactive"} 
                          color={isActive ? "success" : "error"}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Level: {interview.level}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Available until: {new Date(interview.endDate).toLocaleDateString()}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Code: {interview.code}
                      </Typography>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant={isCopied ? "contained" : "outlined"}
                          color={isCopied ? "success" : "primary"}
                          startIcon={isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                          onClick={() => handleCopyCode(interview.code)}
                          sx={{
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          {isCopied ? 'Copied!' : 'Copy Code'}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => navigate(`/interview/${interview.id}/results`)}
                        >
                          View Results
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Trash2Icon size={16} />}
                          onClick={() => handleDeleteClick(interview)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Interview</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Position"
              value={newInterview.position}
              onChange={(e) => setNewInterview({ ...newInterview, position: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={newInterview.description}
              onChange={(e) => setNewInterview({ ...newInterview, description: e.target.value })}
              helperText="Describe the skills the candidate must have and the tools they must master. This description will be used by the model to ask questions."
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Level</InputLabel>
              <Select
                value={newInterview.level}
                label="Level"
                onChange={(e) => setNewInterview({ ...newInterview, level: e.target.value })}
              >
                <MenuItem value="Junior">Junior</MenuItem>
                <MenuItem value="Middle">Middle</MenuItem>
                <MenuItem value="Senior">Senior</MenuItem>
              </Select>
            </FormControl>
            <DatePicker
              label="End Date"
              value={newInterview.endDate}
              onChange={(newValue) => setNewInterview({ ...newInterview, endDate: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  required: true
                }
              }}
            />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
              Required Skills (Optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              These skills will be referenced by the AI when generating interview questions
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(SKILLS_CONFIG).map(([key, { label, checked }]) => (
                <Grid item xs={6} key={key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) => handleSkillChange(key, e.target.checked)}
                      />
                    }
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateInterview}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" sx={{ color: theme.palette.error.main }}>
            Delete Interview
          </DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              Are you sure you want to delete the interview for position "{interviewToDelete?.position}"? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              startIcon={<Trash2Icon size={16} />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={copiedCode !== null}
          onClose={() => setCopiedCode(null)}
          TransitionComponent={Fade}
          message="Code copied to clipboard"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={2000}
        />

      </Container>

      <Footer />
    </div>
  );
};

export default CompanyDashboard;
