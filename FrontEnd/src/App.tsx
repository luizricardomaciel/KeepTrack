import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { Container, CssBaseline, Box, Typography, Button, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'; // Added
import { darkTheme } from './components/ThemeUi/DarckTheme'; 
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AssetDetailPage from './pages/AssetDetailPage';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { isLoading: authLoading } = useAuth();

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
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
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