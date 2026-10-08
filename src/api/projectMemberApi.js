import axiosInstance from './axiosInstance';

export const projectMemberApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/project-members');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/project-members/${id}`);
    return response.data;
  },

  create: async (memberData) => {
    const response = await axiosInstance.post('/project-members', memberData);
    return response.data;
  },

  update: async (id, memberData) => {
    const response = await axiosInstance.put(`/project-members/${id}`, memberData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/project-members/${id}`);
    return response.data;
  },
};

export default projectMemberApi;
