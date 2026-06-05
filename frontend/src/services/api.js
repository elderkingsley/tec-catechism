import axios from 'axios';

// Base URL for Laravel API
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - adds token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // If 401 Unauthorized, user's token is invalid
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login (only if not already there)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Auth API calls
export const authAPI = {
  // Login user
  login: (credentials) => api.post('/login', credentials),
  
  // Logout user
  logout: () => api.post('/logout'),
  
  // Get current user
  getCurrentUser: () => api.get('/user'),
};

// Tracks API calls
export const tracksAPI = {
  // Get all tracks (public)
  getAll: () => api.get('/tracks'),
  
  // Upload new track (admin only, with file)
  create: (formData) => api.post('/tracks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Update track metadata (admin only)
  update: (id, data) => api.put(`/tracks/${id}`, data),
  
  // Delete track (admin only)
  delete: (id) => api.delete(`/tracks/${id}`),
};
