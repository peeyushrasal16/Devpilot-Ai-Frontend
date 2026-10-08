import axiosInstance from './axiosInstance';

export const commentApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/comments');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/comments/${id}`);
    return response.data;
  },

  create: async (commentData) => {
    const response = await axiosInstance.post('/comments', commentData);
    return response.data;
  },

  update: async (id, commentData) => {
    const response = await axiosInstance.put(`/comments/${id}`, commentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/comments/${id}`);
    return response.data;
  },
};

export default commentApi;
