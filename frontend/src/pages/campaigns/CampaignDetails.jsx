import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  ListItemIcon,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  CardGiftcard as RewardIcon,
  Campaign as CampaignIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { campaignService, referralService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaignResponse = await campaignService.getCampaign(id);
        setCampaign(campaignResponse.data.data);
        
        const referralsResponse = await referralService.getReferrals();
        // Filter referrals for this campaign
        const campaignReferrals = referralsResponse.data.data.filter(
          referral => referral.campaign._id === id
        );
        setReferrals(campaignReferrals);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load campaign details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.deleteCampaign(id);
        navigate('/campaigns');
      } catch (err) {
        console.error('Error deleting campaign:', err);
        setError('Failed to delete campaign. Please try again.');
      }
    }
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Campaigns', link: '/campaigns', icon: <CampaignIcon fontSize="small" /> },
    { text: campaign?.name || 'Campaign Details', link: `/campaigns/${id}`, icon: <DescriptionIcon fontSize="small" /> },
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
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <EmptyState
          title="Campaign not found"
          description="The campaign you're looking for doesn't exist or you don't have permission to view it."
          icon={<CampaignIcon fontSize="large" />}
          action
          actionText="Back to Campaigns"
          onActionClick={() => navigate('/campaigns')}
        />
      </Container>
    );
  }

  // Status chip color mapping
  const statusColors = {
    active: 'success',
    inactive: 'default',
    draft: 'warning'
  };

  // Calculate campaign stats
  const totalReferrals = referrals.length;
  const totalClicks = referrals.reduce((sum, ref) => sum + ref.linkClicks, 0);
  const totalConversions = referrals.reduce((sum, ref) => 
    sum + ref.referred.filter(r => r.status === 'converted').length, 0);
  const conversionRate = totalReferrals > 0 
    ? ((totalConversions / totalReferrals) * 100).toFixed(1) 
    : 0;

  return (
    <>
      <PageHeader
        title={campaign.name}
        subtitle={`Campaign created on ${new Date(campaign.createdAt).toLocaleDateString()}`}
        breadcrumbs={breadcrumbs}
        action
        actionText="Edit Campaign"
        actionIcon={<EditIcon />}
        actionLink={`/campaigns/${id}/edit`}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Campaign Actions */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => navigate(`/referrals/new?campaignId=${id}`)}
          >
            Create Referral Link
          </Button>
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            component={Link}
            to={`/analytics/campaign/${id}`}
          >
            View Analytics
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>

        {/* Campaign Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Referral Links
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {totalReferrals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Clicks
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {totalClicks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Conversions
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {totalConversions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Conversion Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {conversionRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<DescriptionIcon />} label="Details" />
            <Tab icon={<RewardIcon />} label="Reward" />
            <Tab icon={<GroupIcon />} label="Referrals" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ px: 3 }}>
            {/* Details Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Campaign Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip 
                        label={campaign.status.toUpperCase()} 
                        color={statusColors[campaign.status]} 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {campaign.description || 'No description provided'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Campaign Dates
                      </Typography>
                      <List dense disablePadding>
                        <ListItem disablePadding sx={{ pt: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <EventIcon fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Start Date" 
                            secondary={new Date(campaign.startDate).toLocaleDateString()}
                          />
                        </ListItem>
                        {campaign.endDate && (
                          <ListItem disablePadding sx={{ pt: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <EventIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="End Date" 
                              secondary={new Date(campaign.endDate).toLocaleDateString()}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    AI Assistant Settings
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        AI Follow-ups
                      </Typography>
                      <Chip 
                        label={campaign.aiFollowUpEnabled ? 'Enabled' : 'Disabled'} 
                        color={campaign.aiFollowUpEnabled ? 'success' : 'default'} 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    
                    {campaign.aiFollowUpEnabled && (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Follow-up Frequency
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                            {campaign.followUpFrequency}
                            {campaign.followUpFrequency === 'custom' && campaign.customFollowUpDays && 
                              ` (${campaign.customFollowUpDays} days)`}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          The AI assistant will automatically send follow-up messages to potential referrals
                          based on this schedule to maximize conversion rates.
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Reward Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Reward Details
              </Typography>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Reward Type
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 0.5 }}>
                        {campaign.rewardType === 'discount' ? 'Discount' : 'Cash Payout'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Reward Value
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 0.5 }}>
                        {campaign.rewardType === 'discount' 
                          ? `${campaign.rewardValue}% Off` 
                          : `$${campaign.rewardValue}`}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {campaign.rewardType === 'discount' ? (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Discount Code
                        </Typography>
                        <Chip 
                          label={campaign.discountCode} 
                          color="primary" 
                          sx={{ mt: 0.5, fontSize: '1.1rem' }}
                        />
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payout Method
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.5, textTransform: 'uppercase' }}>
                          {campaign.payoutMethod}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  How Rewards Work
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaign.rewardType === 'discount' 
                    ? `When a referral converts, the referrer will receive a ${campaign.rewardValue}% discount 
                       that can be applied to their next purchase using the code "${campaign.discountCode}".`
                    : `When a referral converts, the referrer will receive a $${campaign.rewardValue} payout 
                       via ${campaign.payoutMethod.toUpperCase()} once the payout is approved.`}
                </Typography>
              </Paper>
            </TabPanel>

            {/* Referrals Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Active Referral Links
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={() => navigate(`/referrals/new?campaignId=${id}`)}
                >
                  Create New Referral
                </Button>
              </Box>
              
              {referrals.length > 0 ? (
                <Grid container spacing={3}>
                  {referrals.map((referral) => (
                    <Grid item xs={12} md={6} key={referral._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {referral.referrer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {referral.referrer.email || referral.referrer.phone}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Link Clicks
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {referral.linkClicks}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Referrals
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {referral.referred.length}
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Conversions
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {referral.referred.filter(r => r.status === 'converted').length}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/referrals/${referral._id}`)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="No referrals yet"
                  description="Start creating referral links to grow your business through word-of-mouth marketing."
                  icon={<ShareIcon fontSize="large" />}
                  action
                  actionText="Create Referral Link"
                  onActionClick={() => navigate(`/referrals/new?campaignId=${id}`)}
                  compact
                />
              )}
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Campaign Settings
              </Typography>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/campaigns/${id}/edit`)}
                  >
                    Edit Campaign
                  </Button>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Delete Campaign
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    This action cannot be undone. All data associated with this campaign will be permanently deleted.
                  </Typography>
                </Box>
              </Paper>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CampaignDetails;
