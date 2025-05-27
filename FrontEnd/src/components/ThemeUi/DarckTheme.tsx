import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BEF264',      // Light lime green
      contrastText: '#1A2E05', // Dark green for text on primary
    },
    secondary: {
      main: '#71717A',      // Medium Grey for secondary elements like Avatar
      contrastText: '#FAFAFA', // White text for contrast
    },
    background: {
      default: '#09090B',   // Very dark (near black)
      paper: '#18181B',     // Slightly lighter dark for paper elements (cards, dialogs)
    },
    text: {
      primary: '#F4F4F5',     // White
      
      secondary: '#A1A1AA',   // Light grey
      disabled: '#71717A',    // Darker grey
    },
    divider: '#3f3f46', // Dark grey for dividers
    error: {
        main: '#f44336', // Default MUI error red, generally works well in dark themes
    },
    action: {
      // Hover and active states can be customized further if needed
      // MUI's default dark theme handling for these is usually good
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#18181B', // AppBar background to match paper or a specific dark tone
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-divider:hover': {
            color: '#BEF264', 
            backgroundColor: 'rgba(190, 242, 100, 0)',
          }
        }
      }
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                backgroundColor: '#18181B', // Ensure dialogs use the dark paper color
            }
        }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: '#18181B', // Cards use the paper background color
            }
        }
    },
    MuiLink: { // For general <a> tag links, if not styled as buttons
        styleOverrides: {
            root: {
                color: '#BEF264',
                '&:hover': {
                    color: '#a8d35a',
                }
            }
        }
    }
  }
});