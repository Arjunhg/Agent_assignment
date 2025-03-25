import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search as SearchIcon,
  CardGiftcard as RewardIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { rewardService, campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reward-tabpanel-${index}`}
      aria-labelledby={`reward-tab-${index}`}
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

const RewardList = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchRewards();
    fetchCampaigns();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardService.getRewards();
      setRewards(response.data.data);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Failed to load rewards. Please try again later.');
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

  // Filter rewards based on search query, status, and campaign
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = 
      reward.referrer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reward.referrer.email && reward.referrer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reward.referrer.phone && reward.referrer.phone.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'all' || reward.status === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || reward.campaign._id === campaignFilter;
    
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  // Grouped rewards by status for tabs
  const pendingRewards = filteredRewards.filter(reward => reward.status === 'pending');
  const approvedRewards = filteredRewards.filter(reward => reward.status === 'approved');
  const paidRewards = filteredRewards.filter(reward => reward.status === 'paid');

  // Status chip color mapping
  const statusColors = {
    pending: 'warning',
    approved: 'info',
    paid: 'success',
    rejected: 'error'
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Rewards', link: '/rewards', icon: <RewardIcon fontSize="small" /> },
  ];

  return (
    <>
      <PageHeader
        title="Rewards"
        subtitle="Manage and track rewards for successful referrals"
        breadcrumbs={breadcrumbs}
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
            <Tab label="All Rewards" />
            <Tab 
              label={
                <>
                  Pending
                  {pendingRewards.length > 0 && (
                    <Chip 
                      label={pendingRewards.length} 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </>
              } 
            />
            <Tab 
              label={
                <>
                  Approved
                  {approvedRewards.length > 0 && (
                    <Chip 
                      label={approvedRewards.length} 
                      color="info" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </>
              } 
            />
            <Tab 
              label={
                <>
                  Paid
                  {paidRewards.length > 0 && (
                    <Chip 
                      label={paidRewards.length} 
                      color="success" 
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
            placeholder="Search rewards..."
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

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

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
          {renderRewardsList(filteredRewards)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderRewardsList(pendingRewards)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderRewardsList(approvedRewards)}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderRewardsList(paidRewards)}
        </TabPanel>
      </Container>
    </>
  );

  function renderRewardsList(rewardsToShow) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ py: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }
    
    if (rewardsToShow.length === 0) {
      return (
        <EmptyState
          title="No rewards found"
          description="There are no rewards matching your search criteria."
          icon={<RewardIcon fontSize="large" />}
          compact
        />
      );
    }
    
    return (
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Referrer</TableCell>
              <TableCell>Campaign</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rewardsToShow.map((reward) => (
              <TableRow key={reward._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {reward.referrer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reward.referrer.email || reward.referrer.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reward.campaign.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {reward.type}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>
                    {reward.type === 'discount' 
                      ? `${reward.value}%` 
                      : `$${reward.value}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={reward.status} 
                    size="small" 
                    color={statusColors[reward.status] || 'default'} 
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(reward.dateEarned).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    component={Link}
                    to={`/rewards/${reward._id}`}
                    title="View details"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
};

export default RewardList;
