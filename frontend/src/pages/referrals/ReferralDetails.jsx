import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CardGiftcard as RewardIcon,
} from '@mui/icons-material';
import { referralService, rewardService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const ReferralDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [selectedReferredId, setSelectedReferredId] = useState('');
  const [statusValue, setStatusValue] = useState('pending');
  const [processingStatus, setProcessingStatus] = useState(false);
  const [rewardProcessing, setRewardProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      const response = await referralService.getReferral(id);
      setReferral(response.data.data);
    } catch (err) {
      console.error('Error fetching referral:', err);
      setError('Failed to load referral details. Please try again later.');
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

  const openStatusUpdateDialog = (referredId, currentStatus) => {
    setSelectedReferredId(referredId);
    setStatusValue(currentStatus);
    setStatusUpdateDialog(true);
  };

  const closeStatusUpdateDialog = () => {
    setStatusUpdateDialog(false);
    setSelectedReferredId('');
    setStatusValue('pending');
  };

  const updateReferredStatus = async () => {
    if (!selectedReferredId) return;
    
    try {
      setProcessingStatus(true);
      
      const payload = {
        referralId: referral._id,
        referredId: selectedReferredId,
        status: statusValue
      };
      
      const response = await referralService.updateReferredStatus(payload);
      
      if (response.data.success) {
        setReferral(response.data.data);
        closeStatusUpdateDialog();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setProcessingStatus(false);
    }
  };

  const processReward = async () => {
    try {
      setRewardProcessing(true);
      
      const response = await rewardService.createReward({
        referralId: referral._id
      });
      
      if (response.data.success) {
        // Refresh referral data to show updated reward claim status
        fetchReferral();
      }
    } catch (err) {
      console.error('Error processing reward:', err);
      setError('Failed to process reward. Please try again.');
    } finally {
      setRewardProcessing(false);
    }
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Referrals', link: '/referrals', icon: <ShareIcon fontSize="small" /> },
    { text: 'Referral Details', link: `/referrals/${id}`, icon: <ShareIcon fontSize="small" /> },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/referrals')}
          >
            Back to Referrals
          </Button>
        </Box>
      </Container>
    );
  }

  if (!referral) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <EmptyState
          title="Referral not found"
          description="The referral you're looking for doesn't exist or you don't have permission to view it."
          icon={<ShareIcon fontSize="large" />}
          action
          actionText="Back to Referrals"
          onActionClick={() => navigate('/referrals')}
        />
      </Container>
    );
  }

  // Calculate statistics
  const convertedCount = referral.referred.filter(r => r.status === 'converted').length;
  const pendingCount = referral.referred.filter(r => r.status === 'pending').length;
  const contactedCount = referral.referred.filter(r => r.status === 'contacted').length;
  const rejectedCount = referral.referred.filter(r => r.status === 'rejected').length;

  // Status chip color mapping
  const statusColors = {
    pending: 'default',
    contacted: 'info',
    converted: 'success',
    rejected: 'error'
  };

  // Check if referrer is eligible for reward
  const isEligibleForReward = convertedCount > 0 && referral.rewardEarned && !referral.rewardClaimed;

  return (
    <>
      <PageHeader
        title={`Referral for ${referral.referrer.name}`}
        subtitle={`Campaign: ${referral.campaign.name}`}
        breadcrumbs={breadcrumbs}
        action
        actionText="Back to Referrals"
        actionIcon={<ArrowBackIcon />}
        actionLink="/referrals"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {copySuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {copySuccess}
          </Alert>
        )}

        {/* Referrer Information */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Referrer Information
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Name"
                    secondary={referral.referrer.name}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                {referral.referrer.email && (
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Email"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {referral.referrer.email}
                        </Box>
                      }
                      primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                )}
                
                {referral.referrer.phone && (
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Phone"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {referral.referrer.phone}
                        </Box>
                      }
                      primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                )}
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Created On"
                    secondary={new Date(referral.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
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
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                This link has been clicked <strong>{referral.linkClicks}</strong> times
              </Typography>
              
              {isEligibleForReward && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600} color="success.main">
                    Reward Eligible!
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RewardIcon />}
                    onClick={processReward}
                    disabled={rewardProcessing}
                  >
                    {rewardProcessing ? <CircularProgress size={24} /> : 'Process Reward'}
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Referral Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Referrals
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {referral.referred.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Converted
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'success.main' }}>
                  {convertedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'text.secondary' }}>
                  {pendingCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Contacted
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'info.main' }}>
                  {contactedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Referred People */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Referred People
          </Typography>
          
          {referral.referred.length === 0 ? (
            <EmptyState
              title="No referred people yet"
              description="When someone uses this referral link, they'll appear here."
              icon={<ShareIcon fontSize="large" />}
              compact
            />
          ) : (
            <Grid container spacing={3}>
              {referral.referred.map((person, index) => (
                <Grid item xs={12} md={6} key={person._id || index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {person.name}
                        </Typography>
                        <Chip 
                          label={person.status.toUpperCase()} 
                          color={statusColors[person.status] || 'default'} 
                          size="small" 
                        />
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        {person.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{person.email}</Typography>
                          </Box>
                        )}
                        
                        {person.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{person.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Referred on {new Date(person.dateReferred).toLocaleDateString()}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openStatusUpdateDialog(person._id, person.status)}
                        >
                          Update Status
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onClose={closeStatusUpdateDialog}>
        <DialogTitle>Update Referral Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="converted">Converted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusUpdateDialog} disabled={processingStatus}>
            Cancel
          </Button>
          <Button
            onClick={updateReferredStatus}
            variant="contained"
            color="primary"
            disabled={processingStatus}
            startIcon={processingStatus ? <CircularProgress size={24} /> : null}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReferralDetails;
