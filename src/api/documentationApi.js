import axiosInstance from './axiosInstance';

export const documentationApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/documentation');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/documentation/${id}`);
    return response.data;
  },

  create: async (docData) => {
    const response = await axiosInstance.post('/documentation', docData);
    return response.data;
  },

  update: async (id, docData) => {
    const response = await axiosInstance.put(`/documentation/${id}`, docData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/documentation/${id}`);
    return response.data;
  },
};

export default documentationApi;
