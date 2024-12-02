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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const skillsList = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue.js',
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Docker',
  'Kubernetes', 'AWS', 'Azure', 'GCP', 'SQL', 'MongoDB', 'Redis',
  'GraphQL', 'REST API', 'TypeScript', 'Git', 'CI/CD'
];

const CreateInterview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    position: '',
    level: '',
    description: '',
    skills: [],
    endDate: null,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      skills: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      endDate: date
    }));
  };

  const generateInterviewCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const interviewData = {
        ...formData,
        code: generateInterviewCode(),
        companyId: user.uid,
        createdAt: new Date().toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      navigate('/company-dashboard');
    } catch (err) {
      console.error('Error creating interview:', err);
      setError('Failed to create interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Interview
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Level</InputLabel>
            <Select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              label="Level"
            >
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="middle">Middle</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Job Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Required Skills</InputLabel>
            <Select
              multiple
              name="skills"
              value={formData.skills}
              onChange={handleSkillsChange}
              input={<OutlinedInput label="Required Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {skillsList.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select the required skills for this position</FormHelperText>
          </FormControl>

          <DatePicker
            label="End Date"
            value={formData.endDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField {...params} fullWidth required sx={{ mb: 3 }} />
            )}
            minDate={new Date()}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/company-dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Create Interview
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateInterview;
