import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';

const StatsCard = ({ title, value, icon, color, loading, subtitle, trend }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '5px',
          height: '100%',
          backgroundColor: color || 'primary.main',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pl: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} thickness={5} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
                {trend && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 1,
                      color: trend.type === 'up' ? 'success.main' : 'error.main',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {trend.icon}
                    <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                      {trend.value}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: color ? `${color}15` : 'primary.lighter',
              borderRadius: '50%',
              width: 48,
              height: 48,
              p: 1.5,
              color: color || 'primary.main'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
