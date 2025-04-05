import api from './api';

export const generateCampaign = async (prompt) => {
  try {
    const response = await api.post('/api/ai/generate-campaign', { prompt });
    return response.data.campaign;
  } catch (error) {
    throw error;
  }
};
