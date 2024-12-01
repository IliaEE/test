import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField,
  Paper,
  IconButton,
  Grid,
  useTheme
} from '@mui/material';
import { 
  Building, 
  User, 
  ArrowRight,
  Moon,
  Sun
} from 'lucide-react';

const Login = ({ toggleColorMode, mode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    interviewCode: '',
  });

  const handleTabChange = (newValue) => {
    setTab(newValue);
    setFormData({
      email: '',
      password: '',
      interviewCode: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === 0) {
      navigate('/company/dashboard');
    } else {
      navigate(`/interview/${formData.interviewCode}`);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        pt: 8,
        pb: 6
      }}
    >
      <IconButton
        onClick={toggleColorMode}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
        }}
      >
        {mode === 'dark' ? (
          <Sun />
        ) : (
          <Moon />
        )}
      </IconButton>

      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            component="h1"
            variant="h2"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Interview Assistant
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Streamline your technical interviews with AI-powered assistance
          </Typography>
        </Box>

        <Grid container spacing={3} maxWidth="sm" sx={{ mx: 'auto', mb: 6 }}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant={tab === 0 ? 'contained' : 'outlined'}
              onClick={() => handleTabChange(0)}
              startIcon={<Building />}
              size="large"
            >
              Company Login
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant={tab === 1 ? 'contained' : 'outlined'}
              onClick={() => handleTabChange(1)}
              startIcon={<User />}
              size="large"
            >
              Candidate Entry
            </Button>
          </Grid>
        </Grid>

        <Paper 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            maxWidth: 'sm',
            mx: 'auto',
            p: 4,
          }}
          elevation={2}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {tab === 0 ? (
              <>
                <TextField
                  fullWidth
                  label="Company Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </>
            ) : (
              <TextField
                fullWidth
                label="Interview Code"
                name="interviewCode"
                value={formData.interviewCode}
                onChange={handleChange}
                required
                variant="outlined"
                helperText="Please enter the code provided by the company"
              />
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
            >
              {tab === 0 ? 'Sign In' : 'Start Interview'}
            </Button>
          </Box>
        </Paper>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ mt: 8 }}
        >
          2024 Interview Assistant. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;
