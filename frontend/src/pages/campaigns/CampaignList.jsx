import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  CampaignOutlined as CampaignIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignService.getCampaigns();
      setCampaigns(response.data.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleEdit = () => {
    navigate(`/campaigns/${selectedCampaign._id}/edit`);
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/campaigns/${selectedCampaign._id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await campaignService.deleteCampaign(selectedCampaign._id);
      setCampaigns(campaigns.filter(c => c._id !== selectedCampaign._id));
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      // Could add a toast notification here for error feedback
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await campaignService.updateCampaign(selectedCampaign._id, { status: newStatus });
      setCampaigns(campaigns.map(c => 
        c._id === selectedCampaign._id ? { ...c, status: newStatus } : c
      ));
      handleMenuClose();
    } catch (err) {
      console.error('Error updating campaign status:', err);
      // Add error notification here
    }
  };

  const getStatusActions = (campaign) => {
    switch (campaign.status) {
      case 'draft':
        return [
          { label: 'Activate', action: () => handleStatusChange('active') },
          { label: 'Edit', action: handleEdit },
          { label: 'Delete', action: handleDelete }
        ];
      case 'active':
        return [
          { label: 'Deactivate', action: () => handleStatusChange('inactive') },
          { label: 'Edit', action: handleEdit }
        ];
      case 'inactive':
        return [
          { label: 'Activate', action: () => handleStatusChange('active') },
          { label: 'Edit', action: handleEdit },
          { label: 'Delete', action: handleDelete }
        ];
      default:
        return [
          { label: 'Edit', action: handleEdit },
          { label: 'Delete', action: handleDelete }
        ];
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status chip color mapping
  const statusColors = {
    active: 'success',
    inactive: 'default',
    draft: 'warning'
  };

  // Reward type chip color mapping
  const rewardTypeColors = {
    discount: 'primary',
    payout: 'secondary'
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Campaigns', link: '/campaigns', icon: <CampaignIcon fontSize="small" /> },
  ];

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle="Create and manage your referral campaigns"
        breadcrumbs={breadcrumbs}
        action
        actionText="New Campaign"
        actionIcon={<AddIcon />}
        actionLink="/campaigns/new"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search and filters */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ py: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description="Start creating referral campaigns to grow your business through word-of-mouth marketing."
            icon={<CampaignIcon fontSize="large" />}
            action
            actionText="Create Campaign"
            onActionClick={() => navigate('/campaigns/new')}
          />
        ) : (
          <Grid container spacing={3}>
            {filteredCampaigns.map((campaign) => (
              <Grid item xs={12} md={6} lg={4} key={campaign._id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12,
                      zIndex: 1
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, campaign)}
                      aria-label="campaign options"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                      <Chip 
                        label={campaign.status} 
                        size="small" 
                        color={statusColors[campaign.status] || 'default'} 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={campaign.rewardType === 'discount' ? 'Discount' : 'Payout'} 
                        size="small" 
                        variant="outlined"
                        color={rewardTypeColors[campaign.rewardType] || 'default'} 
                      />
                    </Box>

                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ pr: 4 }}>
                      {campaign.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                      {campaign.description || 'No description provided'}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Reward: {campaign.rewardType === 'discount' 
                          ? `${campaign.rewardValue}% Off` 
                          : `$${campaign.rewardValue}`}
                      </Typography>
                      {campaign.startDate && (
                        <Typography variant="body2" color="text.secondary">
                          Starts: {new Date(campaign.startDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {campaign.endDate && (
                        <Typography variant="body2" color="text.secondary">
                          Ends: {new Date(campaign.endDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedCampaign && getStatusActions(selectedCampaign).map((action) => (
            <MenuItem key={action.label} onClick={() => {
              action.action();
              handleMenuClose();
            }}>
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </Container>
    </>
  );
};

export default CampaignList;
