import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FirebaseProvider } from './contexts/FirebaseContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import CompanyRegister from './components/CompanyRegister';
import CompanyDashboard from './components/CompanyDashboard';
import CandidateInterview from './components/CandidateInterview';
import InterviewResults from './components/InterviewResults';
import './styles/index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#4338CA',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F9FAFB',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '9999px',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <Box className="app">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<CompanyRegister />} />
                <Route path="/company/dashboard" element={<CompanyDashboard />} />
                <Route path="/interview/:code" element={<CandidateInterview />} />
                <Route path="/interview/:interviewId/results" element={<InterviewResults />} />
              </Routes>
            </Box>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </FirebaseProvider>
  );
}

export default App;
