import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          textAlign: 'center', 
          p: { xs: 4, md: 6 },
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)'
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: { xs: '6rem', md: '8rem' },
            fontWeight: 800,
            color: 'primary.main',
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography 
          variant="h4" 
          component="h2" 
          fontWeight={600} 
          sx={{ mb: 2 }}
        >
          Page Not Found
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            maxWidth: 500, 
            mx: 'auto', 
            fontSize: { xs: '1rem', md: '1.125rem' }
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Check the URL or navigate back to the dashboard.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard"
            startIcon={<HomeIcon />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          If you believe this is an error, please contact support.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound;
