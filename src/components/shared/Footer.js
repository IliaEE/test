import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, IconButton, useTheme } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PsychologyIcon from '@mui/icons-material/Psychology';

export function SharedFooter() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        py: 3
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <PsychologyIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
              HRly
            </Typography>
          </Box>

          {/* Copyright */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, md: 0 } }}>
            © {currentYear} HRly. All rights reserved.
          </Typography>

          {/* Social Links */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
