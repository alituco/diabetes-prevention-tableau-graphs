import { createTheme } from '@mui/material/styles';
import { grey, blue } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'light', // crucial for a light base
    primary: {
      main: blue[600],
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5', // overall page background
      paper: '#ffffff',   // card background
         // custom if you want a 'light gray'
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    // example font override
    fontFamily: `'Roboto', sans-serif`,
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  spacing: 8, // base spacing = 8px
});

export default theme;
