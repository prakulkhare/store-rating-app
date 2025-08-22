import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/api/auth/verify')
        .then(response => {
          setCurrentUser(response.data.user);
        })
        .catch(error => {
          console.error('Token verification failed:', error);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { token: newToken, user } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      showNotification('Login successful!');
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      showNotification(errorMessage, 'error');
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
   
      const userResponse = await axios.get('http://localhost:5000/api/auth/verify');
      setCurrentUser(userResponse.data.user);
      
      showNotification('Account created successfully!');
      return { success: true, user: userResponse.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      showNotification(errorMessage, 'error');
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
    showNotification('Logout successful!');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    notification,
    showNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};