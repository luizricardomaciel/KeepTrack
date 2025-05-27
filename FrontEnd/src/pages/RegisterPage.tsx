// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Container, TextField, Button, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import type { RegisterRequest } from '../types/userTypes';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error: authError, isAuthenticated } = useAuth(); // Assuming register is added to useAuth
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null); // Clear previous form error

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!name.trim() || !email.trim() || !password.trim()) {
        setFormError("All fields are required.");
        return;
    }
    // Basic password strength check (example)
    if (password.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
    }

    const credentials: RegisterRequest = { name, email, password };
    
    // Call the register function from AuthContext
    // The register function in AuthContext should handle navigation on success
    await register(credentials); 
  };
  
  if (isAuthenticated) {
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
          Create Account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            autoComplete="name"
            name="name"
            required
            fullWidth
            id="name"
            label="Full Name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          {formError && (
            <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
              {formError}
            </Alert>
          )}
          {authError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {authError}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid >
              <Button 
                component={RouterLink} 
                to="/login" 
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
                Already have an account? Sign in
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;