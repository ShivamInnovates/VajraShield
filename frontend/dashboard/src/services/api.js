import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const login = (email, password) => {
  return apiClient.post('/api/v1/auth/login', { email, password }).then(res => {
    localStorage.setItem('auth_token', res.data.token);
    return res.data;
  });
};

export const logout = () => {
  localStorage.removeItem('auth_token');
};
