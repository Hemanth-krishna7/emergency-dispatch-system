import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token, ...newUserData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      setToken(token);
      setUser(newUserData);
      toast.success('Registration successful!');
      return newUserData;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
