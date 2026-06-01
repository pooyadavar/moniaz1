import React from 'react';
import QuestionUploadPage from './pages/QuestionUploadPage';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QuestionUploadPage />
    </ThemeProvider>
  );
}; 

export default App;