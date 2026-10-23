import axios from 'axios';

// Empty BASE_URL ensures all requests go through the Vite proxy on same origin (http://localhost:5174)
const BASE_URL = '';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token only to protected endpoints
axiosInstance.interceptors.request.use(
  (config) => {
    const isPublicAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/users/register') ||
      config.url?.includes('/users/check-email') ||
      config.url?.includes('/users/exists');

    if (!isPublicAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Never attach stale JWT to login/register requests
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let friendlyMessage = 'An unexpected error occurred.';

    if (!error.response) {
      friendlyMessage =
        'Unable to connect to the backend server. Please ensure Spring Boot is running on http://localhost:8080.';
    } else {
      const { status, data } = error.response;

      // Extract server message if it exists
      const serverMessage =
        typeof data === 'string'
          ? data
          : data?.message || data?.error;

      switch (status) {
        case 401:
          friendlyMessage =
            serverMessage || 'Session expired or unauthorized request. Please sign in again.';

          // Only redirect if explicit token expiration or invalid signature
          const isExplicitTokenExpired =
            typeof serverMessage === 'string' &&
            (serverMessage.toLowerCase().includes('jwt expired') ||
             serverMessage.toLowerCase().includes('token expired'));

          if (isExplicitTokenExpired) {
            const currentPath = window.location.pathname;
            const isAuthPage =
              currentPath.startsWith('/login') ||
              currentPath.startsWith('/admin') ||
              currentPath.startsWith('/register');

            if (!isAuthPage) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login?expired=true';
            }
          }
          break;

        case 403:
          friendlyMessage =
            serverMessage && serverMessage !== 'Forbidden'
              ? serverMessage
              : 'You do not have permission to perform this action.';
          break;

        case 404:
          friendlyMessage = serverMessage || 'The requested resource was not found.';
          break;

        case 400:
          friendlyMessage = serverMessage || 'Invalid request. Please check the submitted data.';
          break;

        case 500:
          friendlyMessage = serverMessage || 'Something went wrong on the server. Please try again.';
          break;

        default:
          friendlyMessage = serverMessage || `Server responded with status ${status}`;
      }
    }

    error.userMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default axiosInstance;
