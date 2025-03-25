import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon,
  BarChart as BarChartIcon,
  Share as ShareIcon,
  CardGiftcard as RewardIcon,
  Email as MessageIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { analyticsService, campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/dashboard/StatsCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3f51b5', '#f50057', '#4caf50', '#ff9800', '#2196f3', '#9c27b0'];

const CampaignAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    Promise.all([
      fetchCampaign(),
      fetchAnalytics()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setLoading(false);
    });
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await campaignService.getCampaign(id);
      setCampaign(response.data.data);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Failed to load campaign. Please try again later.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsService.getCampaignAnalytics(id);
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again later.');
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Filter analytics based on selected time range
  const filteredAnalytics = analytics.filter(item => {
    const itemDate = new Date(item.date);
    const now = new Date();
    
    switch (timeRange) {
      case '7days':
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        return itemDate >= sevenDaysAgo;
      case '30days':
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        return itemDate >= thirtyDaysAgo;
      case '90days':
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
        return itemDate >= ninetyDaysAgo;
      case 'alltime':
      default:
        return true;
    }
  });

  // Aggregate metrics
  const totalReferrals = filteredAnalytics.reduce((sum, item) => sum + item.metrics.referrals, 0);
  const totalClicks = filteredAnalytics.reduce((sum, item) => sum + item.metrics.linkClicks, 0);
  const totalConversions = filteredAnalytics.reduce((sum, item) => sum + item.metrics.conversions, 0);
  const totalRewards = filteredAnalytics.reduce((sum, item) => sum + item.metrics.rewardsIssued, 0);
  
  // Calculate conversion rate
  const conversionRate = totalReferrals > 0 
    ? ((totalConversions / totalReferrals) * 100).toFixed(1) 
    : 0;
  
  // Calculate click-through rate
  const clickThroughRate = totalClicks > 0 
    ? ((totalReferrals / totalClicks) * 100).toFixed(1) 
    : 0;

  // Prepare time series data
  const prepareTimeSeriesData = () => {
    // Group by date and format for chart
    const dataMap = new Map();
    
    filteredAnalytics.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      const existing = dataMap.get(date) || { 
        date,
        linkClicks: 0,
        referrals: 0,
        conversions: 0
      };
      
      dataMap.set(date, {
        date,
        linkClicks: existing.linkClicks + item.metrics.linkClicks,
        referrals: existing.referrals + item.metrics.referrals,
        conversions: existing.conversions + item.metrics.conversions
      });
    });
    
    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Prepare source data
  const prepareSourceData = () => {
    // Sum up all source metrics
    const totalSMS = filteredAnalytics.reduce((sum, item) => sum + item.source.sms, 0);
    const totalEmail = filteredAnalytics.reduce((sum, item) => sum + item.source.email, 0);
    const totalSocial = filteredAnalytics.reduce((sum, item) => sum + item.source.social, 0);
    const totalDirect = filteredAnalytics.reduce((sum, item) => sum + item.source.direct, 0);
    
    return [
      { name: 'SMS', value: totalSMS },
      { name: 'Email', value: totalEmail },
      { name: 'Social', value: totalSocial },
      { name: 'Direct', value: totalDirect }
    ].filter(item => item.value > 0);
  };

  // Prepare demographics data (if available)
  const prepareDemographicsData = () => {
    // Dummy data - in a real application, this would come from your analytics
    const ageGroups = [
      { name: '18-24', value: 20 },
      { name: '25-34', value: 35 },
      { name: '35-44', value: 25 },
      { name: '45-54', value: 12 },
      { name: '55+', value: 8 }
    ];
    
    return ageGroups;
  };

  const timeSeriesData = prepareTimeSeriesData();
  const sourceData = prepareSourceData();
  const demographicsData = prepareDemographicsData();

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Analytics', link: '/analytics', icon: <AnalyticsIcon fontSize="small" /> },
    { text: campaign?.name || 'Campaign Analytics', link: `/analytics/campaign/${id}`, icon: <CampaignIcon fontSize="small" /> },
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
            onClick={() => navigate('/analytics')}
          >
            Back to Analytics
          </Button>
        </Box>
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Campaign not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/analytics')}
          >
            Back to Analytics
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        title={`${campaign.name} Analytics`}
        subtitle="Detailed performance metrics for this campaign"
        breadcrumbs={breadcrumbs}
        action
        actionText="Back to Analytics"
        actionIcon={<ArrowBackIcon />}
        actionLink="/analytics"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Time Range Filter */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Campaign Status: 
              <Chip 
                label={campaign.status.toUpperCase()} 
                color={
                  campaign.status === 'active' ? 'success' : 
                  campaign.status === 'draft' ? 'warning' : 'default'
                } 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Typography>
            {campaign.startDate && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Start Date: {new Date(campaign.startDate).toLocaleDateString()}
                {campaign.endDate && ` • End Date: ${new Date(campaign.endDate).toLocaleDateString()}`}
              </Typography>
            )}
          </Box>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
              size="small"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="alltime">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Link Clicks"
              value={totalClicks}
              icon={<ShareIcon />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Referrals Generated"
              value={totalReferrals}
              icon={<PersonIcon />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Conversions"
              value={totalConversions}
              icon={<CheckIcon />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              icon={<BarChartIcon />}
              color="secondary.main"
              subtitle={`${totalConversions} out of ${totalReferrals} referrals`}
            />
          </Grid>
        </Grid>

        {/* Performance Over Time */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Performance Over Time
          </Typography>
          
          {timeSeriesData.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No data available for the selected time period
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="linkClicks"
                  name="Link Clicks"
                  stroke="#3f51b5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  name="Referrals"
                  stroke="#f50057"
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
        </Paper>

        {/* Referral Sources and Demographics */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Referral Sources
              </Typography>
              
              {sourceData.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No source data available
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ height: 250, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
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
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mt: 'auto' }}>
                    {sourceData.map((source, index) => (
                      <Box key={source.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              bgcolor: COLORS[index % COLORS.length],
                              borderRadius: '50%',
                              mr: 1
                            }} 
                          />
                          <Typography variant="body2">{source.name}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {source.value} ({Math.round((source.value / sourceData.reduce((a, b) => a + b.value, 0)) * 100)}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Demographics
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographicsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Percentage" fill="#8884d8">
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Age distribution of referrals (estimates)
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Campaign Actions */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CampaignIcon />}
            component={Link}
            to={`/campaigns/${id}`}
          >
            View Campaign Details
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            component={Link}
            to={`/referrals/new?campaignId=${id}`}
          >
            Create Referral Link
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default CampaignAnalytics;
