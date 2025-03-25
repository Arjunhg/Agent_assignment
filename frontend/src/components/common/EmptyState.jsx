import { Box, Typography, Button, Paper } from '@mui/material';

const EmptyState = ({ 
  title = 'No data found', 
  description = 'There are no items to display at the moment.',
  icon,
  action,
  actionText = 'Create New',
  onActionClick,
  compact = false
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 3 : 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.default'
      }}
    >
      {icon && (
        <Box
          sx={{
            mb: 2,
            color: 'text.secondary',
            '& svg': {
              fontSize: compact ? 48 : 72
            }
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography variant={compact ? "h6" : "h5"} fontWeight={600} gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '400px', mb: 3 }}>
        {description}
      </Typography>
      
      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={onActionClick}
          size={compact ? "medium" : "large"}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
