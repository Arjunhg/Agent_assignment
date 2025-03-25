import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Share as ShareIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Redeem as RedeemIcon,
} from '@mui/icons-material';
import { referralService } from '../../services/api';

const ReferralLanding = () => {
  const { referralCode } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referral, setReferral] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const trackReferral = async () => {
      try {
        setLoading(true);
        // Track the click
        const response = await referralService.trackReferralClick(referralCode);
        if (response.data.success) {
          setReferral(response.data.data.referral);
          setCampaign(response.data.data.referral.campaign);
        }
      } catch (err) {
        console.error('Error tracking referral:', err);
        setError('Invalid referral link. Please contact the person who shared this link with you.');
      } finally {
        setLoading(false);
      }
    };

    if (referralCode) {
      trackReferral();
    }
  }, [referralCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || (!formData.email && !formData.phone)) {
      setError('Please provide your name and either email or phone number');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await referralService.addReferred(referralCode, formData);
      
      if (response.data.success) {
        setSuccess(true);
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
        });
      }
    } catch (err) {
      console.error('Error submitting referral:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRewardText = () => {
    if (!campaign) return '';
    
    if (campaign.rewardType === 'discount') {
      return `${campaign.rewardValue}% discount`;
    } else {
      return `$${campaign.rewardValue} cash reward`;
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          p: 3
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
        <Typography variant="h6" textAlign="center">
          Loading referral...
        </Typography>
      </Box>
    );
  }

  if (error && !referral) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Referral Link Error
          </Typography>
          <Typography variant="body1" paragraph>
            This referral link appears to be invalid or has expired.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 4, md: 8 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {success ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <CheckIcon color="success" sx={{ fontSize: 64 }} />
          </Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Thank You!
          </Typography>
          <Typography variant="h6" paragraph color="text.secondary">
            Your information has been submitted successfully.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" paragraph>
            We'll be in touch with you soon about this exclusive offer.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ShareIcon />}
              onClick={() => window.location.reload()}
            >
              Create Your Own Referral Link
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight={800}
                sx={{
                  mb: 2,
                  background: 'linear-gradient(45deg, #3f51b5 30%, #757de8 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Special Offer Just For You
              </Typography>
              <Typography variant="h6" color="text.secondary">
                You've been referred by <strong>{referral?.referrer.name}</strong>
              </Typography>
            </Box>
            
            <Stepper activeStep={0} orientation={isMobile ? "vertical" : "horizontal"} sx={{ mb: 4 }}>
              <Step>
                <StepLabel>Sign Up</StepLabel>
              </Step>
              <Step>
                <StepLabel>Get Contacted</StepLabel>
              </Step>
              <Step>
                <StepLabel>Enjoy Benefits</StepLabel>
              </Step>
            </Stepper>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                How It Works
              </Typography>
              <Typography variant="body1" paragraph>
                Fill out the form to get exclusive access to our offerings. We'll contact you shortly with more details.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="body1">
                  Personal attention and service
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckIcon color="success" />
                <Typography variant="body1">
                  Exclusive offers not available elsewhere
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RedeemIcon color="secondary" />
                <Typography variant="body1">
                  Refer friends and earn {getRewardText()}
                </Typography>
              </Box>
            </Box>
            
            {!isMobile && (
              <Card 
                sx={{ 
                  bgcolor: 'primary.dark',
                  color: 'white',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Become a Referrer Too!
                  </Typography>
                  <Typography variant="body2" paragraph>
                    After signing up, you'll get your own referral link to share. For each successful referral, you'll earn {getRewardText()}.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                height: '100%',
              }}
            >
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Sign Up Now
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                />
                
                <TextField
                  label="Your Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  helperText="Either email or phone is required"
                />
                
                <TextField
                  label="Your Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  helperText="Either email or phone is required"
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mt: 3, py: 1.5 }}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  By submitting, you agree to be contacted about this offer.
                </Typography>
              </form>
            </Paper>
          </Grid>
          
          {isMobile && (
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  bgcolor: 'primary.dark',
                  color: 'white',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Become a Referrer Too!
                  </Typography>
                  <Typography variant="body2" paragraph>
                    After signing up, you'll get your own referral link to share. For each successful referral, you'll earn {getRewardText()}.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default ReferralLanding;
