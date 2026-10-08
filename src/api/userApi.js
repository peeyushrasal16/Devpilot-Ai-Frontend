import axiosInstance from './axiosInstance';

export const userApi = {
  // POST /users/register - payload: { name, email, password, confirmPassword, role }
  register: async (userData) => {
    const response = await axiosInstance.post('/users/register', userData);
    return response.data;
  },

  // GET /users/exists?email=...
  checkEmailExists: async (email) => {
    try {
      const response = await axiosInstance.get('/users/exists', {
        params: { email },
      });
      return response.data; // boolean
    } catch {
      // In case /users/** is strictly restricted to ADMIN or email check endpoint
      return false;
    }
  },
};

export default userApi;
