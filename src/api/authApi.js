import axiosInstance from './axiosInstance';

export const authApi = {
  // POST /auth/login - payload: { email, password }
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data; // { token, userDto }
  },
};

export default authApi;
