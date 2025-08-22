import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const authAPI = {
  verify: () => axios.get(`${API_BASE_URL}/auth/verify`),
};

export const usersAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/users`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/users/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/users`, data),
  updatePassword: (data) => axios.put(`${API_BASE_URL}/users/password`, data),
};

export const storesAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/stores`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/stores/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/stores`, data),
};

export const ratingsAPI = {
  submit: (data) => axios.post(`${API_BASE_URL}/ratings`, data),
  getUserRating: (storeId) => axios.get(`${API_BASE_URL}/ratings/user/${storeId}`),
  getStoreRatings: (storeId) => axios.get(`${API_BASE_URL}/ratings/store/${storeId}`),
};