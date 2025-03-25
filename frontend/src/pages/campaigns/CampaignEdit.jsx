import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Paper,
  Grid,
  MenuItem,
  InputLabel,
  Select,
  Switch,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const CampaignEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rewardType: 'discount',
    rewardValue: '',
    discountCode: '',
    payoutMethod: 'ach',
    status: 'draft',
    startDate: new Date(),
    endDate: null,
    aiFollowUpEnabled: true,
    followUpFrequency: 'weekly',
    customFollowUpDays: 7,
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await campaignService.getCampaign(id);
        
        if (response.data.success) {
          const campaign = response.data.data;
          setFormData({
            name: campaign.name,
            description: campaign.description || '',
            rewardType: campaign.rewardType,
            rewardValue: campaign.rewardValue,
            discountCode: campaign.discountCode || '',
            payoutMethod: campaign.payoutMethod || 'ach',
            status: campaign.status,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            aiFollowUpEnabled: campaign.aiFollowUpEnabled,
            followUpFrequency: campaign.followUpFrequency,
            customFollowUpDays: campaign.customFollowUpDays || 7,
          });
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await campaignService.updateCampaign(id, formData);
      if (response.data.success) {
        navigate(`/campaigns/${id}`);
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err.response?.data?.message || 'Failed to update campaign. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Campaigns', link: '/campaigns', icon: <CampaignIcon fontSize="small" /> },
    { text: 'Edit Campaign', link: `/campaigns/${id}/edit`, icon: <EditIcon fontSize="small" /> },
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
        title="Edit Campaign"
        subtitle="Update your referral campaign settings"
        breadcrumbs={breadcrumbs}
        action
        actionText="Cancel"
        actionIcon={<ArrowBackIcon />}
        actionLink={`/campaigns/${id}`}
      />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Campaign Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                helperText="Give your campaign a clear, descriptive name"
              />

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                helperText="Describe what this campaign is about"
              />

              <FormControl component="fieldset">
                <FormLabel component="legend">Campaign Status</FormLabel>
                <RadioGroup
                  row
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <FormControlLabel value="draft" control={<Radio />} label="Draft" />
                  <FormControlLabel value="active" control={<Radio />} label="Active" />
                  <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
                </RadioGroup>
              </FormControl>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date (Optional)"
                      value={formData.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>

              <FormControl component="fieldset">
                <FormLabel component="legend">Reward Type</FormLabel>
                <RadioGroup
                  row
                  name="rewardType"
                  value={formData.rewardType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="discount" control={<Radio />} label="Discount" />
                  <FormControlLabel value="payout" control={<Radio />} label="Cash Payout" />
                </RadioGroup>
              </FormControl>

              <TextField
                label={`Reward Value ${formData.rewardType === 'discount' ? '(%)' : '($)'}`}
                name="rewardValue"
                value={formData.rewardValue}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                helperText={formData.rewardType === 'discount' ? "Percentage discount to offer" : "Dollar amount to pay out"}
              />

              {formData.rewardType === 'discount' && (
                <TextField
                  label="Discount Code"
                  name="discountCode"
                  value={formData.discountCode}
                  onChange={handleChange}
                  fullWidth
                  required
                  helperText="Code that will be provided to successful referrers"
                />
              )}

              {formData.rewardType === 'payout' && (
                <FormControl fullWidth required>
                  <InputLabel id="payout-method-label">Payout Method</InputLabel>
                  <Select
                    labelId="payout-method-label"
                    name="payoutMethod"
                    value={formData.payoutMethod}
                    onChange={handleChange}
                    label="Payout Method"
                  >
                    <MenuItem value="ach">Direct Deposit (ACH)</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="venmo">Venmo</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.aiFollowUpEnabled}
                      onChange={handleChange}
                      name="aiFollowUpEnabled"
                      color="primary"
                    />
                  }
                  label="Enable AI-powered follow-up messages"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Our AI will automatically send personalized follow-up messages to boost conversion rates
                </Typography>
              </FormControl>

              {formData.aiFollowUpEnabled && (
                <>
                  <FormControl fullWidth>
                    <InputLabel id="follow-up-frequency-label">Follow-up Frequency</InputLabel>
                    <Select
                      labelId="follow-up-frequency-label"
                      name="followUpFrequency"
                      value={formData.followUpFrequency}
                      onChange={handleChange}
                      label="Follow-up Frequency"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>

                  {formData.followUpFrequency === 'custom' && (
                    <TextField
                      label="Custom Days Between Follow-ups"
                      name="customFollowUpDays"
                      value={formData.customFollowUpDays}
                      onChange={handleChange}
                      fullWidth
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  )}
                </>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(`/campaigns/${id}`)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default CampaignEdit;
