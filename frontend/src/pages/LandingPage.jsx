import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  CardGiftcard as RewardIcon,
  ChatBubble as ChatIcon,
  Speed as SpeedIcon,
  Payments as PaymentsIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const featureData = [
    {
      title: 'Smart Referral System',
      description: 'Our AI-powered referral system makes it easier than ever to turn your customers into advocates.',
      icon: <ShareIcon fontSize="large" sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Real-time Analytics',
      description: 'Track your referral campaign performance with detailed analytics and insights.',
      icon: <AnalyticsIcon fontSize="large" sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Flexible Rewards',
      description: 'Choose between discount codes or cash payouts for successful referrals.',
      icon: <RewardIcon fontSize="large" sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'AI Agent Support',
      description: 'Let our AI agents handle follow-ups and optimize your referral campaigns.',
      icon: <ChatIcon fontSize="large" sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Fast Implementation',
      description: 'Get started in minutes with our easy-to-use platform.',
      icon: <SpeedIcon fontSize="large" sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Automated Payments',
      description: 'Automatically process rewards when referrals convert.',
      icon: <PaymentsIcon fontSize="large" sx={{ color: 'primary.main' }} />,
    },
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 10, md: 16 },
          pb: { xs: 8, md: 12 },
          background: 'linear-gradient(to bottom right, #c05e3c10, #f8f0ed)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                  color: 'primary.main',
                }}
              >
                Turn Your Customers Into Your Best Marketers
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, fontWeight: 400 }}
              >
                Grow your business through powerful AI-driven referral marketing
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: 2,
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: 2,
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/referral-hero.svg"
                alt="Referral Marketing"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 500,
                  display: { xs: 'none', md: 'block' },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Everything you need to run successful referral campaigns and boost your business growth
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {featureData.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 3,
                    },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Three simple steps to start growing your business through referrals
            </Typography>
          </Box>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    opacity: 0.2,
                    fontSize: '8rem',
                    position: 'relative',
                  }}
                >
                  1
                </Typography>
                <Box sx={{ mt: -6, mb: 2 }}>
                  <AutoAwesomeIcon
                    sx={{ fontSize: 40, color: 'primary.main' }}
                  />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Set Up Your Campaign
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create your referral campaign, define rewards, and customize your messaging.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    opacity: 0.2,
                    fontSize: '8rem',
                    position: 'relative',
                  }}
                >
                  2
                </Typography>
                <Box sx={{ mt: -6, mb: 2 }}>
                  <PeopleIcon
                    sx={{ fontSize: 40, color: 'primary.main' }}
                  />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Invite Customers
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Share your referral program with existing customers and let them refer others.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    opacity: 0.2,
                    fontSize: '8rem',
                    position: 'relative',
                  }}
                >
                  3
                </Typography>
                <Box sx={{ mt: -6, mb: 2 }}>
                  <RewardIcon
                    sx={{ fontSize: 40, color: 'primary.main' }}
                  />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Reward & Grow
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track referrals, reward successful conversions, and watch your business grow.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: 'primary.main' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Ready to Grow Your Business?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Join thousands of businesses using our platform to accelerate growth through referrals
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.125rem',
                borderRadius: 2,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 