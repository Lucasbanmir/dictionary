'use client';
import { createTheme } from '@mui/material/styles';

export const createAppTheme = () =>
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#006BDB',
        light: '#42a5f5',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 8,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            boxShadow: 'none',
          },
        },
      },
    },
  });

// Backward-compatible default theme (light)
const theme = createAppTheme();
export default theme;
