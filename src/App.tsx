import React from 'react';
import QuestionUploadPage from './pages/QuestionUploadPage';
import MoniazHeader from './components/MoniazHeader';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <MoniazHeader />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <QuestionUploadPage />
    </Box>
  </ThemeProvider>
);

export default App;
