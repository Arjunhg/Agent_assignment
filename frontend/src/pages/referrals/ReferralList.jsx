import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { referralService, campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`referral-tabpanel-${index}`}
      aria-labelledby={`referral-tab-${index}`}
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

const ReferralList = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetchReferrals();
    fetchCampaigns();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await referralService.getReferrals();
      setReferrals(response.data.data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('Failed to load referrals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns();
      setCampaigns(response.data.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  // Filter referrals based on search query and campaign filter
  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = 
      referral.referrer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (referral.referrer.email && referral.referrer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (referral.referrer.phone && referral.referrer.phone.includes(searchQuery));
    
    const matchesCampaign = campaignFilter === 'all' || referral.campaign._id === campaignFilter;
    
    return matchesSearch && matchesCampaign;
  });

  // Get referrals with rewards earned but not claimed
  const pendingRewards = referrals.filter(referral => 
    referral.rewardEarned && !referral.rewardClaimed
  );

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Referrals', link: '/referrals', icon: <ShareIcon fontSize="small" /> },
  ];

  return (
    <>
      <PageHeader
        title="Referrals"
        subtitle="Manage your referral links and track conversions"
        breadcrumbs={breadcrumbs}
        action
        actionText="Create Referral Link"
        actionIcon={<AddIcon />}
        actionLink="/referrals/new"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Referrals" />
            <Tab 
              label={
                <>
                  Pending Rewards
                  {pendingRewards.length > 0 && (
                    <Chip 
                      label={pendingRewards.length} 
                      color="secondary" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </>
              } 
            />
          </Tabs>
        </Paper>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search referrers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Campaign</InputLabel>
            <Select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              label="Campaign"
            >
              <MenuItem value="all">All Campaigns</MenuItem>
              {campaigns.map((campaign) => (
                <MenuItem key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ py: 3 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : filteredReferrals.length === 0 ? (
            <EmptyState
              title="No referrals found"
              description="Create referral links to share with your advocates and start growing your business."
              icon={<ShareIcon fontSize="large" />}
              action
              actionText="Create Referral Link"
              onActionClick={() => navigate('/referrals/new')}
            />
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Referrer</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell align="center">Link Clicks</TableCell>
                    <TableCell align="center">Referrals</TableCell>
                    <TableCell align="center">Conversions</TableCell>
                    <TableCell align="center">Reward Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReferrals.map((referral) => {
                    const conversions = referral.referred.filter(r => r.status === 'converted').length;
                    const isEligibleForReward = conversions > 0;
                    
                    return (
                      <TableRow key={referral._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {referral.referrer.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {referral.referrer.email || referral.referrer.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={referral.campaign.name} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">{referral.linkClicks}</TableCell>
                        <TableCell align="center">{referral.referred.length}</TableCell>
                        <TableCell align="center">{conversions}</TableCell>
                        <TableCell align="center">
                          {referral.rewardClaimed ? (
                            <Chip 
                              icon={<CheckCircleIcon />} 
                              label="Claimed" 
                              color="success" 
                              size="small" 
                            />
                          ) : referral.rewardEarned ? (
                            <Chip 
                              label="Pending" 
                              color="warning" 
                              size="small" 
                            />
                          ) : isEligibleForReward ? (
                            <Chip 
                              label="Eligible" 
                              color="info" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="Not Eligible" 
                              color="default" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopyLink(referral.referralLink)}
                              title="Copy referral link"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/referrals/${referral._id}`}
                              title="View details"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : pendingRewards.length === 0 ? (
            <EmptyState
              title="No pending rewards"
              description="There are no referrals with pending rewards at this time."
              icon={<BarChartIcon fontSize="large" />}
              compact
            />
          ) : (
            <Grid container spacing={3}>
              {pendingRewards.map((referral) => (
                <Grid item xs={12} md={6} key={referral._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {referral.referrer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {referral.referrer.email || referral.referrer.phone}
                          </Typography>
                        </Box>
                        <Chip 
                          label="Reward Earned" 
                          color="success" 
                          size="small" 
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Campaign
                        </Typography>
                        <Typography variant="body1">
                          {referral.campaign.name}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Reward Type
                          </Typography>
                          <Typography variant="body1">
                            {referral.campaign.rewardType === 'discount' ? 'Discount' : 'Cash Payout'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Reward Value
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {referral.campaign.rewardType === 'discount' 
                              ? `${referral.campaign.rewardValue}% Off` 
                              : `$${referral.campaign.rewardValue}`}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/rewards/new?referralId=${referral._id}`)}
                          fullWidth
                        >
                          Process Reward
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {copySuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20, 
              zIndex: 2000,
              boxShadow: 3
            }}
          >
            {copySuccess}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default ReferralList;
