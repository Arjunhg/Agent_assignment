import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { generateCampaign } from '../../services/aiService';

const AICampaignGenerator = ({ open, onClose, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCampaign, setGeneratedCampaign] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a description of your campaign');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const campaign = await generateCampaign(prompt);
      setGeneratedCampaign(campaign);
    } catch (err) {
      console.error('Error generating campaign:', err);
      setError('Failed to generate campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedCampaign) {
      onApply(generatedCampaign);
      onClose();
    }
  };

  const handleClose = () => {
    setPrompt('');
    setError('');
    setGeneratedCampaign(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Campaign with AI</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Describe your campaign idea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., I want to create a referral campaign for a fitness studio targeting young professionals. The campaign should offer a discount for successful referrals and run for 3 months..."
          sx={{ mb: 2 }}
          disabled={loading}
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Generating campaign...</Typography>
          </Box>
        )}

        {generatedCampaign && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Generated Campaign:</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Name" 
                  secondary={generatedCampaign.name} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Description" 
                  secondary={generatedCampaign.description}
                  secondaryTypographyProps={{ style: { whiteSpace: 'pre-wrap' } }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Reward Type" 
                  secondary={`${generatedCampaign.rewardType} - ${
                    generatedCampaign.rewardType === 'discount' 
                      ? `${generatedCampaign.rewardValue}% off` 
                      : `$${generatedCampaign.rewardValue} payout`
                  }`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Campaign Duration" 
                  secondary={`${new Date(generatedCampaign.startDate).toLocaleDateString()} - ${
                    generatedCampaign.endDate 
                      ? new Date(generatedCampaign.endDate).toLocaleDateString()
                      : 'No end date'
                  }`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="AI Follow-ups" 
                  secondary={`${generatedCampaign.aiFollowUpEnabled ? 'Enabled' : 'Disabled'} - ${
                    generatedCampaign.aiFollowUpEnabled ? generatedCampaign.followUpFrequency : 'N/A'
                  }`}
                />
              </ListItem>
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleGenerate} 
          disabled={!prompt.trim() || loading}
          variant="outlined"
        >
          Generate
        </Button>
        <Button 
          onClick={handleApply} 
          disabled={!generatedCampaign || loading}
          variant="contained"
          color="primary"
        >
          Apply to Campaign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AICampaignGenerator;
