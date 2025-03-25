import { Box, Typography, Button, Breadcrumbs, Link, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs, 
  action, 
  actionText, 
  actionIcon, 
  onActionClick,
  actionLink,
  containerWidth = 'lg'
}) => {
  return (
    <Box 
      sx={{ 
        py: 3, 
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth={containerWidth}>
        {breadcrumbs && (
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                component={RouterLink}
                to={crumb.link}
                underline="hover"
                color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
                }}
              >
                {crumb.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.text}
              </Link>
            ))}
          </Breadcrumbs>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {action && (
            <Button
              variant="contained"
              color="primary"
              startIcon={actionIcon}
              onClick={onActionClick}
              component={actionLink ? RouterLink : undefined}
              to={actionLink}
            >
              {actionText || 'Action'}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default PageHeader;
