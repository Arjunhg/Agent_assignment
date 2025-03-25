import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  RadioGroup,
  Radio,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
} from '@mui/material';
import {
  Email as EmailIcon,
  Textsms as TextsmsIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  SmartToy as AIIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { messageService, campaignService, contactService, referralService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const MessageCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [contactsSource, setContactsSource] = useState('all'); // 'all', 'contacts', 'referrals', 'campaign'
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [formData, setFormData] = useState({
    type: 'email',
    subject: '',
    content: '',
    recipients: [],
    campaignId: '',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    status: 'draft',
    aiGenerated: false,
  });

  useEffect(() => {
    Promise.all([
      fetchCampaigns(),
      fetchContacts(),
      fetchReferrals()
    ]).then(() => {
      setDataLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setDataLoading(false);
    });
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns();
      setCampaigns(response.data.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactService.getContacts();
      setContacts(response.data.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await referralService.getReferrals();
      setReferrals(response.data.data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateTimeChange = (date) => {
    setFormData({
      ...formData,
      scheduledFor: date,
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({
      ...formData,
      type: newType,
      // Clear subject if switching to SMS
      ...(newType === 'sms' ? { subject: '' } : {})
    });
  };

  const handleContactSourceChange = (e) => {
    setContactsSource(e.target.value);
    setSelectedContacts([]);
  };

  const toggleContactSelection = (contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleGenerateAIContent = async () => {
    setUseAI(true);
    setFormData({
      ...formData,
      aiGenerated: true,
      content: `Dear {{name}},

I'm excited to share our new referral program with you! 

When you refer friends or colleagues to our service, you'll receive exclusive rewards. Your referrals also get a special welcome offer, making it a win-win for everyone.

Simply share your personalized referral link with anyone you think would benefit from our services. Each successful referral brings you closer to valuable rewards.

Thank you for being a valued part of our community!

Best regards,
The Team`
    });
  };

  const handleSave = async (e, sendNow = false) => {
    e.preventDefault();
    
    if (!formData.content || selectedContacts.length === 0) {
      setError('Please provide message content and select at least one recipient');
      return;
    }
    
    if (formData.type === 'email' && !formData.subject) {
      setError('Please provide a subject for your email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Prepare recipients from selected contacts
      const recipients = selectedContacts.map(contact => 
        formData.type === 'email' ? contact.email : contact.phone
      ).filter(Boolean);
      
      if (recipients.length === 0) {
        setError(`No valid ${formData.type === 'email' ? 'email addresses' : 'phone numbers'} found in selected contacts`);
        setLoading(false);
        return;
      }
      
      // Create messageData without campaignId initially
      const messageData = {
        type: formData.type,
        subject: formData.subject,
        content: formData.content,
        recipients,
        status: sendNow ? 'sent' : isScheduled ? 'scheduled' : 'draft',
        scheduledFor: isScheduled ? formData.scheduledFor : undefined,
        aiGenerated: formData.aiGenerated
      };
      
      // Only add campaignId if it's not empty
      if (formData.campaignId) {
        messageData.campaignId = formData.campaignId;
      }
      
      const response = await messageService.createMessage(messageData);
      
      if (response.data.success) {
        if (sendNow) {
          await messageService.sendMessage(response.data.data._id);
        }
        navigate('/messages');
      }
    } catch (err) {
      console.error('Error creating message:', err);
      setError(err.response?.data?.message || 'Failed to create message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableContacts = () => {
    switch (contactsSource) {
      case 'contacts':
        return contacts.map(contact => ({
          id: contact._id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone
        }));
      case 'referrals':
        return referrals.map(referral => ({
          id: referral._id,
          name: referral.referrer.name,
          email: referral.referrer.email,
          phone: referral.referrer.phone
        }));
      case 'campaign':
        if (!formData.campaignId) return [];
        return referrals
          .filter(referral => referral.campaign._id === formData.campaignId)
          .map(referral => ({
            id: referral._id,
            name: referral.referrer.name,
            email: referral.referrer.email,
            phone: referral.referrer.phone
          }));
      default:
        // Combine both contacts and referrers
        const contactList = contacts.map(contact => ({
          id: `contact_${contact._id}`,
          name: contact.name,
          email: contact.email,
          phone: contact.phone
        }));
        
        const referrerList = referrals.map(referral => ({
          id: `referral_${referral._id}`,
          name: referral.referrer.name,
          email: referral.referrer.email,
          phone: referral.referrer.phone
        }));
        
        return [...contactList, ...referrerList];
    }
  };

  const filteredContacts = getAvailableContacts().filter(contact => 
    formData.type === 'email' ? contact.email : contact.phone
  );

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Messages', link: '/messages', icon: <EmailIcon fontSize="small" /> },
    { text: 'Create Message', link: '/messages/new', icon: <AddIcon fontSize="small" /> },
  ];

  return (
    <>
      <PageHeader
        title="Create Message"
        subtitle="Compose and send messages to your contacts and referrals"
        breadcrumbs={breadcrumbs}
        action
        actionText="Back to Messages"
        actionIcon={<ArrowBackIcon />}
        actionLink="/messages"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {dataLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={(e) => handleSave(e, false)}>
            <Grid container spacing={4}>
              {/* Left Column - Message Content */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, mb: 4 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <Box sx={{ mb: 3 }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Message Type</FormLabel>
                      <RadioGroup
                        row
                        name="type"
                        value={formData.type}
                        onChange={handleTypeChange}
                      >
                        <FormControlLabel 
                          value="email" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Email
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="sms" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TextsmsIcon fontSize="small" sx={{ mr: 0.5 }} />
                              SMS
                            </Box>
                          } 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  
                  {formData.type === 'email' && (
                    <TextField
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                    />
                  )}
                  
                  <TextField
                    label="Message Content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    rows={8}
                    helperText={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        Use {"{{name}}"} to personalize with the recipient's name
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<AIIcon />}
                          onClick={handleGenerateAIContent}
                          sx={{ ml: 2 }}
                          disabled={useAI}
                        >
                          Generate with AI
                        </Button>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                          name="isScheduled"
                          color="primary"
                        />
                      }
                      label="Schedule for later"
                    />
                    
                    {isScheduled && (
                      <Box sx={{ mt: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DateTimePicker
                            label="Schedule Date & Time"
                            value={formData.scheduledFor}
                            onChange={handleDateTimeChange}
                            minDateTime={new Date()}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                        </LocalizationProvider>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              {/* Right Column - Recipients */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Recipients
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="contact-source-label">Contact Source</InputLabel>
                    <Select
                      labelId="contact-source-label"
                      value={contactsSource}
                      onChange={handleContactSourceChange}
                      label="Contact Source"
                    >
                      <MenuItem value="all">All Contacts</MenuItem>
                      <MenuItem value="contacts">Imported Contacts</MenuItem>
                      <MenuItem value="referrals">Referrers</MenuItem>
                      <MenuItem value="campaign">Campaign Specific</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {contactsSource === 'campaign' && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="campaign-label">Campaign</InputLabel>
                      <Select
                        labelId="campaign-label"
                        name="campaignId"
                        value={formData.campaignId}
                        onChange={handleChange}
                        label="Campaign"
                      >
                        {campaigns.map((campaign) => (
                          <MenuItem key={campaign._id} value={campaign._id}>
                            {campaign.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Selected Recipients: <strong>{selectedContacts.length}</strong>
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedContacts.map((contact) => (
                        <Chip
                          key={contact.id}
                          label={contact.name}
                          onDelete={() => toggleContactSelection(contact)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Available {formData.type === 'email' ? 'Email' : 'SMS'} Recipients
                  </Typography>
                  
                  {filteredContacts.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No {formData.type === 'email' ? 'email' : 'SMS'} recipients available in this source
                    </Alert>
                  ) : (
                    <List dense sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      {filteredContacts.map((contact) => {
                        const isSelected = selectedContacts.some(c => c.id === contact.id);
                        
                        return (
                          <ListItem 
                            key={contact.id}
                            selected={isSelected}
                            onClick={() => toggleContactSelection(contact)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <ListItemText 
                              primary={contact.name} 
                              secondary={formData.type === 'email' ? contact.email : contact.phone} 
                            />
                            <ListItemSecondaryAction>
                              <Checkbox 
                                edge="end"
                                checked={isSelected}
                                onChange={() => toggleContactSelection(contact)}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                  
                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setSelectedContacts(filteredContacts)}
                      disabled={filteredContacts.length === 0}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setSelectedContacts([])}
                      disabled={selectedContacts.length === 0}
                      fullWidth
                    >
                      Clear Selection
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/messages')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                Save as Draft
              </Button>
              
              {isScheduled ? (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  startIcon={<ScheduleIcon />}
                  onClick={(e) => handleSave(e, false)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Schedule'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={(e) => handleSave(e, true)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Now'}
                </Button>
              )}
            </Box>
          </form>
        )}
      </Container>
    </>
  );
};

export default MessageCreate;
