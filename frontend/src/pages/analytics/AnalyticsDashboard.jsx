import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Campaign as CampaignIcon,
  Check as CheckIcon,
  BarChart as BarChartIcon,
  Share as ShareIcon,
  CardGiftcard as RewardIcon,
  Email as MessageIcon,
} from '@mui/icons-material';
import { analyticsService, campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/dashboard/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3f51b5', '#f50057', '#4caf50', '#ff9800', '#2196f3', '#9c27b0'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [campaign, setCampaign] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    Promise.all([
      fetchAnalytics(),
      fetchCampaigns()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setLoading(false);
    });
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsService.getAnalytics();
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again later.');
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

  const handleGenerateAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await analyticsService.generateAnalytics();
      await fetchAnalytics();
    } catch (err) {
      console.error('Error generating analytics:', err);
      setError('Failed to generate analytics. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleCampaignChange = (event) => {
    setCampaign(event.target.value);
  };

  // Filter analytics based on selected campaign and time range
  const filteredAnalytics = analytics.filter(item => {
    const matchesCampaign = campaign === 'all' || item.campaign._id === campaign;
    const itemDate = new Date(item.date);
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        return matchesCampaign && itemDate >= sevenDaysAgo;
      case '30days':
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        return matchesCampaign && itemDate >= thirtyDaysAgo;
      case '90days':
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
        return matchesCampaign && itemDate >= ninetyDaysAgo;
      case 'alltime':
      default:
        return matchesCampaign;
    }
  });

  // Aggregate metrics
  const totalReferrals = filteredAnalytics.reduce((sum, item) => sum + item.metrics.referrals, 0);
  const totalClicks = filteredAnalytics.reduce((sum, item) => sum + item.metrics.linkClicks, 0);
  const totalConversions = filteredAnalytics.reduce((sum, item) => sum + item.metrics.conversions, 0);
  const totalRewards = filteredAnalytics.reduce((sum, item) => sum + item.metrics.rewardsIssued, 0);
  const totalMessages = filteredAnalytics.reduce((sum, item) => sum + item.metrics.messagesSent, 0);
  
  // Calculate conversion rate
  const conversionRate = totalReferrals > 0 
    ? ((totalConversions / totalReferrals) * 100).toFixed(1) 
    : 0;

  // Trend indicators - could be calculated in a real app by comparing to previous period
  const referralsTrend = { type: 'up', value: '+12%', icon: <TrendingUpIcon fontSize="small" /> };
  const conversionTrend = { type: 'up', value: '+5%', icon: <TrendingUpIcon fontSize="small" /> };
  const clicksTrend = { type: 'down', value: '-3%', icon: <TrendingDownIcon fontSize="small" /> };

  // Prepare chart data
  const prepareConversionsData = () => {
    // Group by date and sum conversions
    const dataMap = new Map();
    
    filteredAnalytics.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      const existing = dataMap.get(date) || { 
        date,
        referrals: 0,
        conversions: 0,
        clicks: 0
      };
      
      dataMap.set(date, {
        date,
        referrals: existing.referrals + item.metrics.referrals,
        conversions: existing.conversions + item.metrics.conversions,
        clicks: existing.clicks + item.metrics.linkClicks
      });
    });
    
    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareSourceData = () => {
    // Sum up all source metrics
    const totalSMS = filteredAnalytics.reduce((sum, item) => sum + item.source.sms, 0);
    const totalEmail = filteredAnalytics.reduce((sum, item) => sum + item.source.email, 0);
    const totalSocial = filteredAnalytics.reduce((sum, item) => sum + item.source.social, 0);
    
    return [
      { name: 'SMS', value: totalSMS },
      { name: 'Email', value: totalEmail },
      { name: 'Social', value: totalSocial }
    ].filter(item => item.value > 0);
  };

  const prepareCampaignData = () => {
    // Group by campaign and sum conversions
    const dataMap = new Map();
    
    filteredAnalytics.forEach(item => {
      const campaignName = item.campaign.name;
      const existing = dataMap.get(campaignName) || { 
        name: campaignName,
        conversions: 0,
        referrals: 0
      };
      
      dataMap.set(campaignName, {
        name: campaignName,
        conversions: existing.conversions + item.metrics.conversions,
        referrals: existing.referrals + item.metrics.referrals
      });
    });
    
    return Array.from(dataMap.values());
  };

  const conversionData = prepareConversionsData();
  const sourceData = prepareSourceData();
  const campaignData = prepareCampaignData();

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Analytics', link: '/analytics', icon: <AnalyticsIcon fontSize="small" /> },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Track and analyze your referral marketing performance"
        breadcrumbs={breadcrumbs}
        action
        actionText="Refresh Data"
        actionIcon={<RefreshIcon />}
        onActionClick={handleGenerateAnalytics}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {refreshing && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Refreshing analytics data...
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="alltime">All Time</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="campaign-label">Campaign</InputLabel>
            <Select
              labelId="campaign-label"
              value={campaign}
              onChange={handleCampaignChange}
              label="Campaign"
            >
              <MenuItem value="all">All Campaigns</MenuItem>
              {campaigns.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatsCard
              title="Referral Links"
              value={totalReferrals}
              icon={<ShareIcon />}
              color="primary.main"
              loading={refreshing}
              trend={referralsTrend}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatsCard
              title="Link Clicks"
              value={totalClicks}
              icon={<TimelineIcon />}
              color="info.main"
              loading={refreshing}
              trend={clicksTrend}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatsCard
              title="Conversions"
              value={totalConversions}
              icon={<CheckIcon />}
              color="success.main"
              loading={refreshing}
              trend={conversionTrend}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatsCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              icon={<BarChartIcon />}
              color="secondary.main"
              loading={refreshing}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatsCard
              title="Rewards Issued"
              value={totalRewards}
              icon={<RewardIcon />}
              color="warning.main"
              loading={refreshing}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatsCard
              title="Messages Sent"
              value={totalMessages}
              icon={<MessageIcon />}
              color="error.main"
              loading={refreshing}
            />
          </Grid>
        </Grid>

        {/* Charts Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Performance" />
            <Tab label="Referral Sources" />
            <Tab label="Campaign Comparison" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Referral Performance Over Time
              </Typography>
              
              {conversionData.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No data available for the selected time period
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      name="Link Clicks"
                      stroke="#2196f3"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="referrals"
                      name="Referrals"
                      stroke="#3f51b5"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      name="Conversions"
                      stroke="#4caf50"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Referral Sources
              </Typography>
              
              {sourceData.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No source data available for the selected time period
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 4 }}>
                      {sourceData.map((item, index) => (
                        <Box key={item.name} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor: COLORS[index % COLORS.length],
                                  mr: 1,
                                }}
                              />
                              <Typography variant="body1">{item.name}</Typography>
                            </Box>
                            <Typography variant="body1" fontWeight={500}>
                              {item.value} ({Math.round((item.value / sourceData.reduce((sum, s) => sum + s.value, 0)) * 100)}%)
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 4,
                              width: '100%',
                              bgcolor: 'background.default',
                              borderRadius: 2,
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${(item.value / sourceData.reduce((sum, s) => sum + s.value, 0)) * 100}%`,
                                bgcolor: COLORS[index % COLORS.length],
                                borderRadius: 2,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Campaign Performance Comparison
              </Typography>
              
              {campaignData.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No campaign data available for the selected time period
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={campaignData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="referrals" name="Referrals" fill="#3f51b5" />
                    <Bar dataKey="conversions" name="Conversions" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Campaign Performance Details
                </Typography>
                <Grid container spacing={2}>
                  {campaignData.map((item) => (
                    <Grid item xs={12} md={6} lg={4} key={item.name}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Referrals:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.referrals}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Conversions:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.conversions}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Conversion Rate:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.referrals > 0 ? ((item.conversions / item.referrals) * 100).toFixed(1) : 0}%
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/analytics/campaign/${campaigns.find(c => c.name === item.name)?._id}`)}
                        >
                          View Details
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default AnalyticsDashboard;
