// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/App.tsx
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { useAuth } from './hooks/useAuth'; // Import useAuth to handle initial loading state

function AppContent() {
  const { isLoading: authLoading } = useAuth();

  // Display a global loader if initial auth check is in progress
  // This prevents content flashing or incorrect redirects before auth state is known
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container component="main" sx={{ mt: 2, mb: 2, py: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Example of a protected route - can be wrapped in a <ProtectedRoute> component later */}
          {/* <Route path="/assets" element={isAuthenticated ? <AssetsPage /> : <Navigate to="/login" />} /> */}
          <Route path="*" element={
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h4">404 - Page Not Found</Typography>
              <Button component={RouterLink} to="/home" variant="contained" sx={{ mt: 2 }}>
                Go Home
              </Button>
            </Box>
          } />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <>
      <CssBaseline /> {/* MUI helper for consistent baseline styles */}
      <AppContent />
    </>
  );
}

export default App;