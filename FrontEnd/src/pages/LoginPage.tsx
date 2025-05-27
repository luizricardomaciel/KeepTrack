// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import { useAuth } from '../hooks/useAuth';
import { Container, TextField, Button, Typography, Box, CircularProgress, Alert} from '@mui/material'; // Import Grid
import Grid from '@mui/material/Grid'; // Import Grid for layout

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await login({ email, password });
  };

  if (isAuthenticated) { // Should be handled by useEffect, but as a safeguard
    return null; 
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid > {/* Corrected from <Grid> to <Grid item> for semantic correctness, though not strictly necessary for this change */}
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="text" 
                size="small"
                sx={{ 
                  color: 'text.primary', 
                  transition: 'color 0.3s ease-in-out', // Added transition
                  '&:hover': {
                    color: 'primary.main', 
                    backgroundColor: 'transparent', 
                  }
                }}
              >
                {"Don't have an account? Sign Up"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;