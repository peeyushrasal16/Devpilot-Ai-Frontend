import axiosInstance from './axiosInstance';

export const bugApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/bugs');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/bugs/${id}`);
    return response.data;
  },

  create: async (bugData) => {
    const response = await axiosInstance.post('/bugs', bugData);
    return response.data;
  },

  update: async (id, bugData) => {
    const response = await axiosInstance.put(`/bugs/${id}`, bugData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/bugs/${id}`);
    return response.data;
  },
};

export default bugApi;
