import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Share as ShareIcon,
  Home as HomeIcon,
  ContentCopy as ContentCopyIcon,
  Facebook as FacebookIcon,
  Email as EmailIcon,
  Textsms as TextsmsIcon,
  WhatsApp as WhatsAppIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { campaignService, referralService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const ReferralCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [referral, setReferral] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    campaignId: '',
  });

  // Extract campaignId from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campaignId = params.get('campaignId');
    
    if (campaignId) {
      setFormData(prev => ({ ...prev, campaignId }));
    }
    
    fetchCampaigns();
  }, [location]);

  const fetchCampaigns = async () => {
    try {
      setCampaignLoading(true);
      const response = await campaignService.getCampaigns();
      
      // Filter to only active campaigns
      const activeCampaigns = response.data.data.filter(
        campaign => campaign.status === 'active'
      );
      
      setCampaigns(activeCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.campaignId || (!formData.email && !formData.phone)) {
      setError('Please provide name, campaign, and either email or phone number');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await referralService.createReferral(formData);
      
      if (response.data.success) {
        setReferral(response.data.data);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error creating referral:', err);
      setError(err.response?.data?.message || 'Failed to create referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (referral) {
      navigator.clipboard.writeText(referral.referralLink)
        .then(() => {
          setCopySuccess('Link copied to clipboard!');
          setTimeout(() => setCopySuccess(''), 3000);
        })
        .catch(() => {
          setError('Failed to copy link. Please try again.');
        });
    }
  };

  const shareViaEmail = () => {
    if (referral) {
      const subject = 'Check out this special offer';
      const body = `I thought you might be interested in this offer. Click here to learn more: ${referral.referralLink}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }
  };

  const shareViaSMS = () => {
    if (referral) {
      const text = `Check out this special offer: ${referral.referralLink}`;
      window.open(`sms:?&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const shareViaWhatsApp = () => {
    if (referral) {
      const text = `Check out this special offer: ${referral.referralLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const shareViaFacebook = () => {
    if (referral) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referral.referralLink)}`, '_blank');
    }
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Referrals', link: '/referrals', icon: <ShareIcon fontSize="small" /> },
    { text: 'Create Referral', link: '/referrals/new', icon: <ShareIcon fontSize="small" /> },
  ];

  const selectedCampaign = campaigns.find(c => c._id === formData.campaignId);

  return (
    <>
      <PageHeader
        title="Create Referral Link"
        subtitle="Generate a unique referral link to share with potential customers"
        breadcrumbs={breadcrumbs}
        action
        actionText="Back to Referrals"
        actionIcon={<ArrowBackIcon />}
        actionLink="/referrals"
      />

      <Container maxWidth="md" sx={{ py: 4 }}>
        {!success ? (
          <Paper sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Referrer Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  helperText="The name of the person who is referring others"
                />

                <TextField
                  label="Referrer Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  helperText="Either email or phone number is required"
                />

                <TextField
                  label="Referrer Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  helperText="Either email or phone number is required"
                />

                <FormControl fullWidth required>
                  <InputLabel id="campaign-label">Campaign</InputLabel>
                  <Select
                    labelId="campaign-label"
                    name="campaignId"
                    value={formData.campaignId}
                    onChange={handleChange}
                    label="Campaign"
                    disabled={campaignLoading}
                  >
                    {campaignLoading ? (
                      <MenuItem value="" disabled>
                        Loading campaigns...
                      </MenuItem>
                    ) : campaigns.length === 0 ? (
                      <MenuItem value="" disabled>
                        No active campaigns available
                      </MenuItem>
                    ) : (
                      campaigns.map((campaign) => (
                        <MenuItem key={campaign._id} value={campaign._id}>
                          {campaign.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {selectedCampaign && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Selected Campaign: {selectedCampaign.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedCampaign.description || 'No description provided'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reward:</strong> {selectedCampaign.rewardType === 'discount' 
                        ? `${selectedCampaign.rewardValue}% Discount` 
                        : `$${selectedCampaign.rewardValue} Payout`}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/referrals')}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<ShareIcon />}
                    disabled={loading || campaignLoading || !formData.campaignId}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate Referral Link'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        ) : (
          <Box>
            {copySuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {copySuccess}
              </Alert>
            )}

            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Referral Link Created Successfully
              </Typography>
              
              <Typography variant="body1" paragraph>
                You've created a referral link for <strong>{referral.referrer.name}</strong> for the 
                <strong> {campaigns.find(c => c._id === referral.campaign.toString())?.name}</strong> campaign.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Referral Link
                </Typography>
                <TextField
                  value={referral.referralLink}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Copy to clipboard">
                          <IconButton onClick={handleCopyLink} edge="end">
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Share this link
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose how you'd like to share this referral link:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={shareViaEmail}
                >
                  Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TextsmsIcon />}
                  onClick={shareViaSMS}
                >
                  SMS
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon />}
                  onClick={shareViaWhatsApp}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={shareViaFacebook}
                >
                  Facebook
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyLink}
                >
                  Copy Link
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="text" 
                  onClick={() => {
                    setSuccess(false);
                    setReferral(null);
                  }}
                >
                  Create Another
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/referrals')}
                >
                  View All Referrals
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ReferralCreate;
