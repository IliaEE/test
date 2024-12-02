import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import CompanyRegister from './components/CompanyRegister';
import CompanyDashboard from './components/CompanyDashboard';
import CandidateInterview from './components/CandidateInterview';
import InterviewResults from './components/InterviewResults';
import StartInterview from './components/StartInterview';
import CreateInterview from './components/CreateInterview';
import './styles/index.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
    },
    secondary: {
      main: '#10B981',
    }
  }
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Box className="app">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<CompanyRegister />} />
              <Route path="/start-interview" element={<StartInterview />} />
              <Route 
                path="/company-dashboard/*" 
                element={
                  <ProtectedRoute>
                    <CompanyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-interview" 
                element={
                  <ProtectedRoute>
                    <CreateInterview />
                  </ProtectedRoute>
                } 
              />
              <Route path="/interview/:code" element={<CandidateInterview />} />
              <Route path="/interview/:interviewId/results" element={<InterviewResults />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
