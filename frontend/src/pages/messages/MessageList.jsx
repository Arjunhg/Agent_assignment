import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  Card,
  CardContent,
  CardActions,
  Menu,
  MenuItem,
  ListItemIcon,
  Tab,
  Tabs,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Textsms as TextsmsIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  SmartToy as AIIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { messageService } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`message-tabpanel-${index}`}
      aria-labelledby={`message-tab-${index}`}
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

const MessageList = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages();
      setMessages(response.data.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleSendMessage = async (id) => {
    try {
      setSendingId(id);
      await messageService.sendMessage(id);
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
      // Could add toast notification here
    } finally {
      setSendingId(null);
    }
  };

  // Filter messages based on search query and tab
  const filteredMessages = messages.filter(message => 
    (message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group messages by status
  const draftMessages = filteredMessages.filter(message => message.status === 'draft');
  const scheduledMessages = filteredMessages.filter(message => message.status === 'scheduled');
  const sentMessages = filteredMessages.filter(message => message.status === 'sent');

  const currentMessages = tabValue === 0 
    ? filteredMessages 
    : tabValue === 1 
      ? draftMessages 
      : tabValue === 2 
        ? scheduledMessages 
        : sentMessages;

  // Status chip color mapping
  const statusColors = {
    draft: 'default',
    scheduled: 'info',
    sent: 'success',
    failed: 'error'
  };

  const breadcrumbs = [
    { text: 'Home', link: '/dashboard', icon: <HomeIcon fontSize="small" /> },
    { text: 'Messages', link: '/messages', icon: <EmailIcon fontSize="small" /> },
  ];

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Create and send messages to your contacts and referrals"
        breadcrumbs={breadcrumbs}
        action
        actionText="Create Message"
        actionIcon={<AddIcon />}
        actionLink="/messages/new"
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
            <Tab label="All Messages" />
            <Tab 
              label={
                <>
                  Drafts
                  {draftMessages.length > 0 && (
                    <Chip 
                      label={draftMessages.length} 
                      color="default" 
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
                  Scheduled
                  {scheduledMessages.length > 0 && (
                    <Chip 
                      label={scheduledMessages.length} 
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
                  Sent
                  {sentMessages.length > 0 && (
                    <Chip 
                      label={sentMessages.length} 
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

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search messages..."
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

        <TabPanel value={tabValue} index={0}>
          {renderMessages(currentMessages)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderMessages(currentMessages)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {renderMessages(currentMessages)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {renderMessages(currentMessages)}
        </TabPanel>
      </Container>

      {/* Message options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 }
        }}
      >
        <MenuItem onClick={() => {
          navigate(`/messages/${selectedMessage?._id}/edit`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleSendMessage(selectedMessage?._id);
          handleMenuClose();
        }} disabled={selectedMessage?.status === 'sent'}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          Send Now
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );

  function renderMessages(messagesToShow) {
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
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }
    
    if (messagesToShow.length === 0) {
      return (
        <EmptyState
          title="No messages found"
          description="Start creating messages to reach out to your contacts and referrals."
          icon={<EmailIcon fontSize="large" />}
          action
          actionText="Create Message"
          onActionClick={() => navigate('/messages/new')}
        />
      );
    }
    
    return (
      <Grid container spacing={3}>
        {messagesToShow.map((message) => (
          <Grid item xs={12} md={6} lg={4} key={message._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ pb: '16px !important', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {message.type === 'email' ? (
                      <EmailIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    ) : (
                      <TextsmsIcon color="secondary" fontSize="small" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="subtitle1" fontWeight={600}>
                      {message.type === 'email' ? 'Email' : 'SMS'}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip 
                      label={message.status} 
                      size="small" 
                      color={statusColors[message.status] || 'default'} 
                    />
                    {message.aiGenerated && (
                      <Tooltip title="AI Generated">
                        <AIIcon fontSize="small" color="info" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                
                {message.subject && (
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                    {message.subject}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {message.content}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Recipients:
                  </Typography>
                  <Typography variant="body2">
                    {message.recipients.length} {message.recipients.length === 1 ? 'contact' : 'contacts'}
                  </Typography>
                </Box>
                
                {message.scheduledFor && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scheduled for:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(message.scheduledFor).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                
                {message.sentAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Sent at:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(message.sentAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                {message.status === 'draft' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={() => handleSendMessage(message._id)}
                    disabled={sendingId === message._id}
                  >
                    {sendingId === message._id ? <CircularProgress size={24} /> : 'Send'}
                  </Button>
                )}
                
                {message.status === 'scheduled' && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={() => handleSendMessage(message._id)}
                    disabled={sendingId === message._id}
                  >
                    Send Now
                  </Button>
                )}
                
                {message.status === 'sent' && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                  >
                    Duplicate
                  </Button>
                )}
                
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, message)}
                  disabled={sendingId === message._id}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default MessageList;
