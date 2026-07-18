import axios from 'axios';

// Backend base URL. See 기술명세서 §2 — FastAPI backend, /api/v1 prefix.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Set by store/useUserStore on login/signup, and by ensureAuth() on silent
// token refresh. Kept outside React so the interceptor can reach it without
// a hook.
let authToken = null;
let onAuthExpired = null;

export function setAuthToken(token) {
  authToken = token;
}

// Registered once by ensureAuth(); called when a request 401s so we can
// silently re-login (no refresh-token flow on this backend — see
// backend/app/core/security.py) and retry the original request.
export function setAuthExpiredHandler(handler) {
  onAuthExpired = handler;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Backend error shape (기술명세서 §6): raised via HTTPException(detail={...}),
// which FastAPI nests under a top-level "detail" key.
function normalizeError(error) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;
  return {
    error_code: (typeof detail === 'object' && detail?.error_code) || 'UNKNOWN_ERROR',
    message: (typeof detail === 'object' && detail?.message) || (typeof detail === 'string' ? detail : null) || error.message || '알 수 없는 오류가 발생했어요.',
    status: status ?? 0,
  };
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = normalizeError(error);
    const original = error.config;

    if (normalized.status === 401 && onAuthExpired && !original._retried) {
      original._retried = true;
      try {
        await onAuthExpired();
        return apiClient(original);
      } catch (_) {
        // fall through to rejection below
      }
    }

    return Promise.reject(normalized);
  }
);