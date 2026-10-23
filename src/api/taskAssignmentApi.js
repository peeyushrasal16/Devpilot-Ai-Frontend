import axiosInstance from './axiosInstance';

export const taskAssignmentApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/task-assignments');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/task-assignments/${id}`);
    return response.data;
  },

  create: async (assignmentData) => {
    const response = await axiosInstance.post('/task-assignments', assignmentData);
    return response.data;
  },

  update: async (id, assignmentData) => {
    const response = await axiosInstance.put(`/task-assignments/${id}`, assignmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/task-assignments/${id}`);
    return response.data;
  },
};

export default taskAssignmentApi;
