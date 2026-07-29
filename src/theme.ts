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
      dark: '#005f9e',
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
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2b42',
      secondary: '#6b7280',
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
            '#ffffff',
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
          backgroundColor: '#0072BC',
          '&:hover': {
            backgroundColor: '#005f9e',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#d4d4d8',
          color: '#171717',
          '&:hover': {
            borderColor: '#a1a1aa',
            backgroundColor: '#f7f7f8',
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
            '& fieldset': { borderColor: '#e5e5e5' },
            '&:hover fieldset': { borderColor: '#a1a1aa' },
            '&.Mui-focused fieldset': { borderColor: '#0072BC', borderWidth: 2 },
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
