import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField,
  Paper,
  MenuItem,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AuthNavbar } from './auth/AuthNavbar';
import { useFirebase } from '../contexts/FirebaseContext';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const firebase = useFirebase();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    customIndustry: '',
    size: '',
    site: '',
  });

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
  ];

  const industries = [
    'IT',
    'Finance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'industry' && value !== 'Other' ? { customIndustry: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebase) {
      setError('Firebase is not initialized yet. Please try again.');
      return;
    }

    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.industry === 'Other' && !formData.customIndustry.trim()) {
      setError('Please specify your industry');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        firebase.auth,
        formData.email,
        formData.password
      );

      // Add company data to Firestore
      const companyData = {
        companyName: formData.companyName,
        email: formData.email,
        industry: formData.industry === 'Other' ? formData.customIndustry : formData.industry,
        size: formData.size,
        site: formData.site,
        role: 'company',
        plan: 'free',
        status: 'active',
        createdAt: new Date().toISOString(),
        uid: userCredential.user.uid,
      };

      await setDoc(doc(firebase.db, 'companies', userCredential.user.uid), companyData);

      // Navigate to dashboard
      navigate('/company/dashboard');
    } catch (error) {
      console.error('Error registering company:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (!firebase) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AuthNavbar />
      
      <Container maxWidth="md">
        <Box sx={{ pt: { xs: 12, sm: 16 }, pb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Register Your Company
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary" 
            paragraph
            sx={{ maxWidth: 'sm', mx: 'auto' }}
          >
            Create an account to start using our AI-powered interview platform
          </Typography>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 6 },
            borderRadius: 2,
            maxWidth: 'md',
            mx: 'auto',
            mb: 8
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={formData.industry === 'Other' ? 6 : 6}>
                <TextField
                  fullWidth
                  select
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  {industries.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {formData.industry === 'Other' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specify Industry"
                    name="customIndustry"
                    value={formData.customIndustry}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    placeholder="Enter your industry"
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Company Size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  {companySizes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Website"
                  name="site"
                  value={formData.site}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="https://example.com"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    mt: 2,
                    py: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  {loading ? 'Registering Company...' : 'Register Company'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyRegister;
