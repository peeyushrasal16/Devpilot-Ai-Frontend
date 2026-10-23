import axiosInstance from './axiosInstance';

export const userApi = {
  // POST /users/register - payload: { name, email, password, confirmPassword, role }
  register: async (userData) => {
    const response = await axiosInstance.post('/users/register', userData);
    return response.data;
  },

  // GET /users - returns list of users [{ id, name, role }]
  getAll: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  // GET /users/exists?email=... or /users/check-email?email=...
  checkEmailExists: async (email) => {
    try {
      const response = await axiosInstance.get('/users/exists', {
        params: { email },
      });
      return response.data; // boolean
    } catch {
      try {
        const fallback = await axiosInstance.get('/users/check-email', {
          params: { email },
        });
        return fallback.data;
      } catch {
        return false;
      }
    }
  },
};

export default userApi;
