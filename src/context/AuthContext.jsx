import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import userApi from '../api/userApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial sync check
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Proactively clear stale session before initiating login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);

    try {
      const data = await authApi.login({ email, password });
      // Backend returns: { token: "...", userDto: { id, name, email, role, ... } }
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.userDto));
        setToken(data.token);
        setUser(data.userDto);
        return { success: true, user: data.userDto };
      } else {
        throw new Error('Invalid response from authentication server.');
      }
    } catch (err) {
      const message =
        err.userMessage ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await userApi.register(userData);
      return { success: true, data };
    } catch (err) {
      const message =
        err.userMessage ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isProjectManager = () => user?.role === 'PROJECT_MANAGER';
  const isDeveloper = () => user?.role === 'DEVELOPER';

  const hasAnyRole = (roles = []) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isProjectManager,
    isDeveloper,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
