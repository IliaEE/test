import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Card,
  CardContent,
  Chip,
  useTheme,
  AppBar,
  Toolbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Plus as PlusIcon,
  Copy as CopyIcon,
  X as XIcon,
  Code2 as CodeIcon,
  Briefcase as BriefcaseIcon,
  ChevronRight as ChevronRightIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Trash2 as Trash2Icon
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import { createInterview, getCompanyInterviews, deleteInterview } from '../services/firebase';

// Skills configuration
const SKILLS_CONFIG = {
  javascript: { label: 'JavaScript', checked: false },
  python: { label: 'Python', checked: false },
  react: { label: 'React', checked: false },
  node: { label: 'Node.js', checked: false },
  qa: { label: 'QA', checked: false },
  testing: { label: 'Testing', checked: false }
};

const CompanyDashboard = ({ darkMode, toggleDarkMode, companyId = 'test-company' }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newInterview, setNewInterview] = useState({
    position: '',
    description: '',
    level: 'middle',
    skills: []
  });

  // Create a test interview for development
  const createTestInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const testInterview = {
        position: 'QA Engineer',
        description: 'We are looking for a QA Engineer with strong Python skills',
        level: 'middle',
        skills: ['python', 'qa', 'testing'],
        companyId: companyId,
        questions: [
          {
            id: '1',
            type: 'coding',
            content: 'Write a Python function to validate email addresses using regex.',
            expectedAnswer: 'import re\n\ndef validate_email(email):\n    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"\n    return bool(re.match(pattern, email))',
            maxScore: 10
          },
          {
            id: '2',
            type: 'theory',
            content: 'Explain the difference between unit testing and integration testing.',
            expectedAnswer: 'Unit testing focuses on individual components while integration testing verifies interactions between components.',
            maxScore: 10
          }
        ]
      };

      const result = await createInterview(testInterview);
      console.log('Test interview created:', result);
      
      // Copy interview code to clipboard
      navigator.clipboard.writeText(result.code);
      alert(`Test interview created! Code: ${result.code} (copied to clipboard)`);
      
      // Refresh interviews list
      fetchInterviews();
    } catch (error) {
      console.error('Error creating test interview:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch interviews on component mount
  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading interviews for company:', companyId);
        
        if (!companyId) {
          throw new Error('Company ID is required');
        }

        const data = await getCompanyInterviews(companyId);
        console.log('Loaded interviews:', data);
        
        if (!data) {
          console.warn('No interviews found');
          setInterviews([]);
          return;
        }

        setInterviews(data);
      } catch (err) {
        console.error('Error loading interviews:', err);
        setError(err.message || 'Failed to load interviews. Please check your Firebase configuration and network connection.');
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, [companyId]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const data = await getCompanyInterviews(companyId);
      
      if (!data) {
        console.warn('No interviews found');
        setInterviews([]);
        return;
      }

      setInterviews(data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err.message || 'Failed to load interviews. Please check your Firebase configuration and network connection.');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!newInterview.position || !newInterview.level) {
        setError('Please fill in all required fields');
        return;
      }

      const selectedSkills = Object.entries(SKILLS_CONFIG)
        .filter(([key, value]) => value.checked)
        .map(([key]) => key);

      if (selectedSkills.length === 0) {
        setError('Please select at least one skill');
        return;
      }

      const interviewData = {
        ...newInterview,
        skills: selectedSkills,
        companyId,
        questions: [], // Will be generated by OpenAI service
        answers: {},
        evaluations: {},
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const result = await createInterview(interviewData);
      console.log('Interview created:', result);
      
      if (result?.code) {
        // Copy interview code to clipboard
        navigator.clipboard.writeText(result.code);
        alert(`Interview created! Code: ${result.code} (copied to clipboard)`);
        
        // Reset form
        setNewInterview({
          position: '',
          description: '',
          level: 'middle',
          skills: []
        });
        
        // Close dialog
        setOpenDialog(false);
        
        // Refresh interviews list
        fetchInterviews();
      } else {
        throw new Error('Failed to create interview');
      }
    } catch (err) {
      console.error('Error creating interview:', err);
      setError(err.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteInterview(interviewId);
      fetchInterviews();
    } catch (err) {
      console.error('Error deleting interview:', err);
      setError('Failed to delete interview');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !interviews.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 2 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              <BriefcaseIcon style={{ marginRight: '10px', verticalAlign: 'bottom' }} />
              Interview Dashboard
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              onClick={createTestInterview}
              startIcon={<CodeIcon />}
              sx={{ mr: 2 }}
            >
              Create Test Interview
            </Button>

            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Create Interview
            </Button>

            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              sx={{ ml: 2 }}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {interviews.map((interview) => (
          <Grid item xs={12} sm={6} md={4} key={interview.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {interview.position}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Level: {interview.level}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {interview.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={SKILLS_CONFIG[skill]?.label || skill}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<CopyIcon size={16} />}
                    onClick={() => {
                      navigator.clipboard.writeText(interview.code);
                      alert('Interview code copied to clipboard!');
                    }}
                  >
                    Copy Code
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteInterview(interview.id)}
                  >
                    <Trash2Icon size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Position"
              value={newInterview.position}
              onChange={(e) => setNewInterview(prev => ({ ...prev, position: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newInterview.description}
              onChange={(e) => setNewInterview(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={newInterview.level}
                onChange={(e) => setNewInterview(prev => ({ ...prev, level: e.target.value }))}
                label="Level"
              >
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="middle">Middle</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle1" gutterBottom>
              Required Skills
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(SKILLS_CONFIG).map(([key, { label, checked }]) => (
                <Grid item xs={6} key={key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) => {
                          SKILLS_CONFIG[key].checked = e.target.checked;
                          setNewInterview(prev => ({ ...prev }));
                        }}
                      />
                    }
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateInterview}
            disabled={!newInterview.position || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyDashboard;
