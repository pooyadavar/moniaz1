import React from 'react';
import QuestionUploadPage from './pages/QuestionUploadPage';
import MoniazHeader from './components/MoniazHeader';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
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
      <QuestionUploadPage />
    </Box>
  </ThemeProvider>
);

export default App;
