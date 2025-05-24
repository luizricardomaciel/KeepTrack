// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Global styles
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx'; // Import AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);