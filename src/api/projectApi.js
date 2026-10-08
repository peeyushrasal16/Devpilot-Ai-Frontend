import axiosInstance from './axiosInstance';

export const projectApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await axiosInstance.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await axiosInstance.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  },

  getProjections: async () => {
    const response = await axiosInstance.get('/projects/projection');
    return response.data;
  },
};

export default projectApi;
