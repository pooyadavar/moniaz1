import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gray: { main: string; light: string; dark: string; };
    yellow: { main: string; };
    glass: { main: string; border: string; };
  }
  interface PaletteOptions {
    gray?: { main?: string; light?: string; dark?: string; };
    yellow?: { main?: string; };
    glass?: { main?: string; border?: string; };
  }
}

const theme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'dark',
    primary: {
      main: '#a855f7', // Modern purple
      light: '#d8b4fe',
      dark: '#7e22ce',
    },
    secondary: {
      main: '#ec4899', // Pink accent
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.03)',
    },
    gray: {
      main: '#9ca3af',
      light: '#f3f4f6',
      dark: '#4b5563',
    },
    yellow: {
      main: '#fde047',
    },
    glass: {
      main: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
    }
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: "'Vazirmatn', 'IRANSans', system-ui, -apple-system, sans-serif",
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at top left, #2a0845, #140d21 40%, #0f1016 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '100px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          color: '#fff',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a855f7',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  },
});

export default theme;