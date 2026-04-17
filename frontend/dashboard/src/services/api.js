import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — auto-logout and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      authService.logout();
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchFlaggedTransactions = (params) => {
  return apiClient.get('/api/v1/transactions/flagged', { params }).then(res => res.data);
};

export const fetchTransactionDetail = (id) => {
  return apiClient.get(`/api/v1/transactions/${id}`).then(res => res.data);
};

export const fetchDashboardMetrics = (timeRange) => {
  return apiClient.get('/api/v1/dashboard/metrics', { params: { time_range: timeRange } }).then(res => res.data);
};

export const submitReview = (txnId, reviewData) => {
  return apiClient.post(`/api/v1/transactions/${txnId}/review`, reviewData).then(res => res.data);
};

export default apiClient;
