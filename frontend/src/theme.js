import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Indigo
      light: '#757de8',
      dark: '#002984',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057', // Pink
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#303030',
      secondary: '#6b778c',
    },
    divider: '#e2e8f0',
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 6px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 12px rgba(0, 0, 0, 0.05)',
    '0px 10px 14px rgba(0, 0, 0, 0.05)',
    '0px 12px 16px rgba(0, 0, 0, 0.05)',
    '0px 14px 18px rgba(0, 0, 0, 0.05)',
    '0px 16px 20px rgba(0, 0, 0, 0.05)',
    '0px 18px 22px rgba(0, 0, 0, 0.05)',
    '0px 20px 24px rgba(0, 0, 0, 0.05)',
    '0px 22px 26px rgba(0, 0, 0, 0.05)',
    '0px 24px 28px rgba(0, 0, 0, 0.05)',
    '0px 26px 30px rgba(0, 0, 0, 0.05)',
    '0px 28px 32px rgba(0, 0, 0, 0.05)',
    '0px 30px 34px rgba(0, 0, 0, 0.05)',
    '0px 32px 36px rgba(0, 0, 0, 0.05)',
    '0px 34px 38px rgba(0, 0, 0, 0.05)',
    '0px 36px 40px rgba(0, 0, 0, 0.05)',
    '0px 38px 42px rgba(0, 0, 0, 0.05)',
    '0px 40px 44px rgba(0, 0, 0, 0.05)',
    '0px 42px 46px rgba(0, 0, 0, 0.05)',
    '0px 44px 48px rgba(0, 0, 0, 0.05)',
    '0px 46px 50px rgba(0, 0, 0, 0.05)',
    '0px 48px 52px rgba(0, 0, 0, 0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3f51b5 30%, #4a5fc1 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.09)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f7f9fc',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3f51b5',
          },
        },
        notchedOutline: {
          borderColor: '#e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#303030',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
