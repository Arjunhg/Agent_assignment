import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CardGiftcard as RewardIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { rewardService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const RewardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusValue, setStatusValue] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [isNewReward, setIsNewReward] = useState(id === 'new');
  
  useEffect(() => {
    fetchReward();
  }, [id]);

  const fetchReward = async () => {
    try {
      setLoading(true);
      
      // Handle 'new' route differently
      if (id === 'new') {
        const queryParams = new URLSearchParams(location.search);
        const referralId = queryParams.get('referralId');
        
        if (!referralId) {
          setError('Referral ID is required to create a new reward.');
          setLoading(false);
          return;
        }
        
        const response = await rewardService.getReward('new?referralId=' + referralId);
        
        if (response.data.isTemplate) {
          // This is a template for a new reward
          setReward(response.data.data);
          setIsNewReward(true);
        } else {
          // A reward already exists
          const existingReward = response.data.data;
          setReward(existingReward);
          setStatusValue(existingReward.status);
          setIsNewReward(false);
        }
      } else {
        // Normal reward fetching
        const response = await rewardService.getReward(id);
        setReward(response.data.data);
        setStatusValue(response.data.data.status);
        setIsNewReward(false);
      }
    } catch (err) {
      console.error('Error fetching reward:', err);
      setError('Failed to load reward details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = () => {
    setStatusDialog(true);
  };

  const closeStatusDialog = () => {
    setStatusDialog(false);
  };
  
  const createNewReward = async () => {
    try {
      setProcessing(true);
      
      const response = await rewardService.createReward({
        referralId: reward.referralId
      });
      
      if (response.data.success) {
        // Navigate to the newly created reward
        navigate(`/rewards/${response.data.data._id}`);
      }
    } catch (err) {
      console.error('Error creating reward:', err);
      setError('Failed to create reward. Please try again.');
      setProcessing(false);
    }
  };

  const updateRewardStatus = async () => {
    try {
      setProcessing(true);
      
      const payload = {
        status: statusValue,
      };
      
      // Add transaction ID if status is 'paid'
      if (statusValue === 'paid' && transactionId) {
        payload.transactionId = transactionId;
      }
      
      const response = await rewardService.updateRewardStatus(id, payload);
      
      if (response.data.success) {
        setReward(response.data.data);
        closeStatusDialog();
      }
    } catch (err) {
      console.error('Error updating reward status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Rewards', link: '/rewards', icon: <RewardIcon fontSize="small" /> },
    { text: isNewReward ? 'Create Reward' : 'Reward Details', link: isNewReward ? '/rewards/new' : `/rewards/${id}`, icon: <RewardIcon fontSize="small" /> },
  ];

  // Status chip color mapping
  const statusColors = {
    pending: 'warning',
    approved: 'info',
    paid: 'success',
    rejected: 'error'
  };

  // Get active step based on reward status
  const getActiveStep = (status) => {
    switch (status) {
      case 'approved':
        return 1;
      case 'paid':
        return 2;
      case 'rejected':
        return -1; // Special case for rejected
      default:
        return 0; // pending is default
    }
  };

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
            onClick={() => navigate('/rewards')}
          >
            Back to Rewards
          </Button>
        </Box>
      </Container>
    );
  }

  if (!reward) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <EmptyState
          title="Reward not found"
          description="The reward you're looking for doesn't exist or you don't have permission to view it."
          icon={<RewardIcon fontSize="large" />}
          action
          actionText="Back to Rewards"
          onActionClick={() => navigate('/rewards')}
        />
      </Container>
    );
  }

  // For new reward creation
  if (isNewReward) {
    return (
      <>
        <PageHeader
          title="Create Reward"
          subtitle={`Process reward for ${reward.referrer.name}`}
          breadcrumbs={breadcrumbs}
          action
          actionText="Back to Rewards"
          actionIcon={<ArrowBackIcon />}
          actionLink="/rewards"
        />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Reward Information</Typography>
            
            <Grid container spacing={4} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Referrer Information
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{reward.referrer.name}</Typography>
                </Box>
                
                {reward.referrer.email && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{reward.referrer.email}</Typography>
                  </Box>
                )}
                
                {reward.referrer.phone && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{reward.referrer.phone}</Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Campaign Information
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Campaign</Typography>
                  <Typography variant="body1">{reward.campaign.name}</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Reward Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{reward.type}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Reward Value</Typography>
                    <Typography variant="body1" fontWeight={500} color="success.main">
                      {reward.type === 'discount' ? `${reward.value}% Off` : `$${reward.value}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={createNewReward}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              >
                Process Reward
              </Button>
            </Box>
          </Paper>
        </Container>
      </>
    );
  }

  // Regular reward display (existing reward)
  return (
    <>
      <PageHeader
        title="Reward Details"
        subtitle={`Reward for ${reward.referrer.name}`}
        breadcrumbs={breadcrumbs}
        action
        actionText="Back to Rewards"
        actionIcon={<ArrowBackIcon />}
        actionLink="/rewards"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Status Stepper */}
        {reward.status !== 'rejected' && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={getActiveStep(reward.status)} alternativeLabel>
              <Step>
                <StepLabel>Pending Review</StepLabel>
              </Step>
              <Step>
                <StepLabel>Approved</StepLabel>
              </Step>
              <Step>
                <StepLabel>Paid</StepLabel>
              </Step>
            </Stepper>
          </Paper>
        )}

        {/* Rejected Status Alert */}
        {reward.status === 'rejected' && (
          <Alert severity="error" sx={{ mb: 4 }}>
            This reward has been rejected.
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Referrer Information
              </Typography>
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Name"
                    secondary={reward.referrer.name}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                {reward.referrer.email && (
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Email"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {reward.referrer.email}
                        </Box>
                      }
                      primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                )}
                
                {reward.referrer.phone && (
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Phone"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {reward.referrer.phone}
                        </Box>
                      }
                      primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Campaign Information
              </Typography>
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Campaign"
                    secondary={reward.campaign.name}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Date Earned"
                    secondary={new Date(reward.dateEarned).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                
                {reward.datePaid && (
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Date Paid"
                      secondary={new Date(reward.datePaid).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                )}
                
                {reward.transactionId && (
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Transaction ID"
                      secondary={reward.transactionId}
                      primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'body1', fontFamily: 'monospace' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
          
          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Reward Information
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={reward.status.toUpperCase()} 
                    color={statusColors[reward.status] || 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                <Button 
                  variant="outlined" 
                  onClick={openStatusDialog}
                  disabled={reward.status === 'paid'}
                >
                  Update Status
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reward Type
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                    {reward.type}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reward Value
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, color: 'success.main' }}>
                    {reward.type === 'discount' 
                      ? `${reward.value}% Off` 
                      : `$${reward.value}`}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              {reward.type === 'discount' ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Discount Code
                  </Typography>
                  <Typography variant="h5" fontFamily="monospace" sx={{ 
                    backgroundColor: 'secondary.light', 
                    py: 2, 
                    px: 3, 
                    borderRadius: 1,
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {reward.discountCode || '—'}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Payout Method
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, textTransform: 'uppercase' }}>
                    {reward.payoutMethod}
                  </Typography>
                  
                  {reward.payoutDetails && Object.keys(reward.payoutDetails).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Payout Details
                      </Typography>
                      
                      {reward.payoutDetails.accountNumber && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Account Number:</strong> {reward.payoutDetails.accountNumber}
                        </Typography>
                      )}
                      
                      {reward.payoutDetails.routingNumber && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Routing Number:</strong> {reward.payoutDetails.routingNumber}
                        </Typography>
                      )}
                      
                      {reward.payoutDetails.venmoId && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Venmo ID:</strong> {reward.payoutDetails.venmoId}
                        </Typography>
                      )}
                      
                      {reward.payoutDetails.paypalEmail && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>PayPal Email:</strong> {reward.payoutDetails.paypalEmail}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Update Status Dialog */}
      <Dialog open={statusDialog} onClose={closeStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Update Reward Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={statusValue}
              label="Status"
              onChange={(e) => setStatusValue(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </Select>
          </FormControl>
          
          {statusValue === 'paid' && (
            <TextField
              margin="dense"
              label="Transaction ID (Optional)"
              fullWidth
              variant="outlined"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              sx={{ mt: 3 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={updateRewardStatus} 
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RewardDetails;