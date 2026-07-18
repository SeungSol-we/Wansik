import axios from 'axios';

// Backend base URL. Override with REACT_APP_API_BASE_URL in .env when the
// FastAPI backend (see 기술명세서 §2) is running somewhere other than localhost.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes backend errors into the {error_code, message, status} shape
// documented in 기술명세서 §6 so callers can branch on error_code directly.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const normalized = {
      error_code: payload?.error_code || 'UNKNOWN_ERROR',
      message: payload?.message || error.message || '알 수 없는 오류가 발생했어요.',
      status: status ?? 0,
    };
    return Promise.reject(normalized);
  }
);