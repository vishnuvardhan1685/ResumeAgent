import axiosInstance from './axiosInstance';

/**
 * auth.api.js
 *
 * Matches backend routes/auth.js  →  /api/auth/*
 *
 * Backend endpoints (from your server/src/routes/auth.js):
 *   POST /api/auth/google          { token: string } → { accessToken, refreshToken, user }
 *   POST /api/auth/refresh         { refreshToken }  → { accessToken }
 *   DELETE /api/auth/logout        {}               → 204
 */

export const googleLogin = async (googleToken) => {
  const { data } = await axiosInstance.post('/api/auth/google', { token: googleToken });
  return data;
};

export const refreshToken = async (refreshTokenStr) => {
  const { data } = await axiosInstance.post('/api/auth/refresh', {
    refreshToken: refreshTokenStr,
  });
  return data; // { accessToken }
};

export const logout = async () => {
  await axiosInstance.delete('/api/auth/logout');
};
