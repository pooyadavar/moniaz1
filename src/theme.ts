import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    navy: { main: string; dark: string };
    gray: { main: string; light: string; dark: string };
  }
  interface PaletteOptions {
    navy?: { main?: string; dark?: string };
    gray?: { main?: string; light?: string; dark?: string };
  }
}

const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#0072BC',
      light: '#4da3ff',
      dark: '#004572',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1e4a8c',
      contrastText: '#ffffff',
    },
    navy: {
      main: '#0c2d6b',
      dark: '#071a3f',
    },
    background: {
      default: '#d1d4d8',
      paper: '#e4e4e4',
    },
    text: {
      primary: '#1a2b42',
      secondary: '#5c6b7a',
    },
    gray: {
      main: '#6b7c8f',
      light: '#f1f5f9',
      dark: '#334155',
    },
    success: {
      main: '#28a745',
      dark: '#1e7e34',
    },
    warning: {
      main: '#ffc107',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Vazirmatn', 'IRANSans', Tahoma, system-ui, sans-serif",
    h3: { fontWeight: 800, color: '#1a2b42' },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'linear-gradient(180deg, #e8f2fc 0%, #f8fbff 35%, #ffffff 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
        contained: {
          backgroundColor: '#007bff',
          '&:hover': {
            backgroundColor: '#0056b3',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
          },
        },
        outlined: {
          borderColor: '#007bff',
          color: '#007bff',
          '&:hover': {
            borderColor: '#0056b3',
            backgroundColor: 'rgba(0, 123, 255, 0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#d0dde8' },
            '&:hover fieldset': { borderColor: '#007bff' },
            '&.Mui-focused fieldset': { borderColor: '#007bff', borderWidth: 2 },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: { '&:before': { display: 'none' } },
      },
    },
  },
});

export default theme;
