import React, { useState } from 'react';
import MoniazHeader from './components/MoniazHeader';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import OperatorShell from './pages/OperatorShell';
import RegisterPage from './pages/RegisterPage';

const AuthGate: React.FC = () => {
  const { isReady, token } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!isReady) {
    return (
      <Box sx={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return mode === 'login' ? (
      <LoginPage onRegisterClick={() => setMode('register')} />
    ) : (
      <RegisterPage onLoginClick={() => setMode('login')} />
    );
  }

  return <OperatorShell />;
};

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            direction: 'rtl',
            fontFamily: "'Vazirmatn', 'IRANSans', Tahoma, system-ui, sans-serif",
          },
        }}
      />
      <MoniazHeader />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AuthGate />
      </Box>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
