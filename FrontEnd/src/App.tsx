import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'; // Added
import { darkTheme } from './components/ThemeUi/DarckTheme'; 
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Import RegisterPage
import HomePage from './pages/HomePage';
import AssetDetailPage from './pages/AssetDetailPage';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { isLoading: authLoading, isAuthenticated } = useAuth(); // Add isAuthenticated

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: darkTheme.palette.background.default }}>
        <CircularProgress color="primary"/>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container component="main" sx={{ mt: 2, mb: 2, py: 2 }}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
          <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* Add route for RegisterPage */}
          <Route path="/assets/:assetId" element={isAuthenticated ? <AssetDetailPage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h4">404 - Page Not Found</Typography>
              <Button component={RouterLink} to="/home" variant="contained" color="primary" sx={{ mt: 2 }}>
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
    <ThemeProvider theme={darkTheme}> {/* Apply the theme */}
      <CssBaseline /> {/* MUI helper for consistent baseline styles, enables dark mode for body etc. */}
      <AppContent />
    </ThemeProvider>
  );
}

export default App;