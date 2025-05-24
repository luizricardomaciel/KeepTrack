// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/pages/HomePage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Typography, Container, Box, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  const { isAuthenticated, user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If auth is still loading, wait. If it's done and user is not authenticated, redirect.
    if (!authIsLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authIsLoading, navigate]);

  if (authIsLoading) {
    return (
      <Container>
        <Typography>Loading user data...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    // This case should be handled by the useEffect redirect,
    // but it's good practice for components that rely on auth.
    return null; // Or a message indicating redirection
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to KeepTrack, {user.name}!
          </Typography>
          <Typography variant="body1">
            This is your dashboard. From here, you can manage your assets and track their maintenance.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
            Your email: {user.email}
          </Typography>
          {/* Future content will go here: upcoming maintenances, quick actions, etc. */}
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;