import axiosInstance from './axiosInstance';

export const activityLogApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/activity-logs');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/activity-logs/${id}`);
    return response.data;
  },

  create: async (logData) => {
    const response = await axiosInstance.post('/activity-logs', logData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/activity-logs/${id}`);
    return response.data;
  },
};

export default activityLogApi;
