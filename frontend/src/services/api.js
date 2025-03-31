import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/me'),
};

// Agent services
export const agentService = {
  createAgent: (agentData) => api.post('/api/agents', agentData),
  getAgents: () => api.get('/api/agents'),
  getAgentById: (id) => api.get(`/api/agents/${id}`),
  updateAgent: (id, agentData) => api.put(`/api/agents/${id}`, agentData),
  deleteAgent: (id) => api.delete(`/api/agents/${id}`),
};

// Contact services
export const contactService = {
  getContacts: () => api.get('/api/contacts'),
  getContactsByAgent: (agentId) => api.get(`/api/contacts/agent/${agentId}`),
  updateContact: (id, contactData) => api.put(`/api/contacts/${id}`, contactData),
  deleteContact: (id) => api.delete(`/api/contacts/${id}`),
  updateTaskStatus: (id, statusData) => api.put(`/api/contacts/${id}/status`, statusData),
  getTaskStats: () => api.get('/api/contacts/stats')
};

// Upload services
export const uploadService = {
  uploadCSV: (contactsData) => api.post('/api/uploads', contactsData),
};

// Campaign services
export const campaignService = {
  createCampaign: (campaignData) => api.post('/api/campaigns', campaignData),
  getCampaigns: () => api.get('/api/campaigns'),
  getCampaign: (id) => api.get(`/api/campaigns/${id}`),
  updateCampaign: (id, campaignData) => api.put(`/api/campaigns/${id}`, campaignData),
  deleteCampaign: (id) => api.delete(`/api/campaigns/${id}`),
};

// Referral services
export const referralService = {
  createReferral: (referralData) => api.post('/api/referrals', referralData),
  getReferrals: () => api.get('/api/referrals'),
  getReferral: (id) => api.get(`/api/referrals/${id}`),
  trackReferralClick: (referralCode) => api.post(`/api/referrals/click/${referralCode}`),
  addReferred: (referralCode, referredData) => api.post(`/api/referrals/refer/${referralCode}`, referredData),
  updateReferredStatus: (statusData) => api.put('/api/referrals/status', statusData),
};

// Reward services
export const rewardService = {
  createReward: (rewardData) => api.post('/api/rewards', rewardData),
  getRewards: () => api.get('/api/rewards'),
  getReward: (id) => api.get(`/api/rewards/${id}`),
  updateRewardStatus: (id, statusData) => api.put(`/api/rewards/${id}`, statusData),
};

// Message services
export const messageService = {
  createMessage: (messageData) => api.post('/api/messages', messageData),
  getMessages: () => api.get('/api/messages'),
  getMessage: (id) => api.get(`/api/messages/${id}`),
  sendMessage: (id) => api.post(`/api/messages/${id}/send`),
  bulkImportAndSend: (bulkData) => api.post('/api/messages/bulk', bulkData),
};

// Analytics services
export const analyticsService = {
  getAnalytics: () => api.get('/api/analytics'),
  getCampaignAnalytics: (campaignId) => api.get(`/api/analytics/campaign/${campaignId}`),
  generateAnalytics: () => api.post('/api/analytics/generate'),
};

export default api;
