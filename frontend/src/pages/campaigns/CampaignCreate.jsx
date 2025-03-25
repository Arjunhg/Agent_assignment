import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Home as HomeIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { campaignService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Campaign Details', 'Reward Settings', 'Follow-up Options'];

const CampaignCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await campaignService.createCampaign(formData);
      if (response.data.success) {
        navigate('/campaigns');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.response?.data?.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Campaigns', link: '/campaigns', icon: <CampaignIcon fontSize="small" /> },
    { text: 'Create Campaign', link: '/campaigns/new', icon: <AddIcon fontSize="small" /> },
  ];

  // Helper function to validate the current step
  const isStepValid = () => {
    if (activeStep === 0) {
      return formData.name.trim() !== ''; // Basic validation for first step
    } else if (activeStep === 1) {
      return (
        formData.rewardValue && 
        (formData.rewardType !== 'discount' || formData.discountCode) &&
        (formData.rewardType !== 'payout' || formData.payoutMethod)
      );
    }
    return true; // Last step is always valid
  };

  return (
    <>
      <PageHeader
        title="Create Campaign"
        subtitle="Set up a new referral campaign to grow your business"
        breadcrumbs={breadcrumbs}
        action
        actionText="Cancel"
        actionIcon={<ArrowBackIcon />}
        actionLink="/campaigns"
      />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
            {/* Step 1: Campaign Details */}
            {activeStep === 0 && (
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
              </Stack>
            )}

            {/* Step 2: Reward Settings */}
            {activeStep === 1 && (
              <Stack spacing={3}>
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
              </Stack>
            )}

            {/* Step 3: Follow-up Options */}
            {activeStep === 2 && (
              <Stack spacing={3}>
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

                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Campaign Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Campaign Name:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {formData.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Reward Type:
                      </Typography>
                      <Typography variant="body1">
                        {formData.rewardType === 'discount' ? 'Discount' : 'Cash Payout'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Reward Value:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {formData.rewardType === 'discount' 
                          ? `${formData.rewardValue}% discount` 
                          : `$${formData.rewardValue} payout`}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {formData.rewardType === 'discount' ? 'Discount Code:' : 'Payout Method:'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {formData.rewardType === 'discount' 
                          ? formData.discountCode 
                          : formData.payoutMethod.toUpperCase()}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        AI Follow-ups:
                      </Typography>
                      <Typography variant="body1">
                        {formData.aiFollowUpEnabled ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading || !isStepValid()}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Campaign'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={!isStepValid()}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default CampaignCreate;
