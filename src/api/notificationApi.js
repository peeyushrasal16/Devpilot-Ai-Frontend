import axiosInstance from './axiosInstance';

export const notificationApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/notifications/${id}`);
    return response.data;
  },

  create: async (notifData) => {
    const response = await axiosInstance.post('/notifications', notifData);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationApi;
