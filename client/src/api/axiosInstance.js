import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * axiosInstance
 *
 * Base URL reads from .env: VITE_API_BASE_URL=http://localhost:5000
 * All requests automatically attach the Authorization header.
 * On 401, attempts a token refresh then retries once.
 *
 */

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ─────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Lazy import to avoid circular dependency with store
    const { accessToken } = JSON.parse(
      localStorage.getItem('agentic-auth') ?? '{}'
    )?.state ?? {};
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 + refresh ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(original);
          })
          .catch(Promise.reject);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const stored = JSON.parse(localStorage.getItem('agentic-auth') ?? '{}')?.state ?? {};
        if (!stored.refreshToken) {
          throw new Error('Missing refresh token');
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/auth/refresh`,
          { refreshToken: stored.refreshToken }
        );

        useAuthStore.getState().setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
