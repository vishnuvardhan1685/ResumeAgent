import useAuthStore from '../store/authStore';
import { logout as logoutApi } from '../api/auth.api';

/**
 * useAuth
 *
 * Thin wrapper around authStore that also handles the logout API call.
 * Use this in components instead of importing authStore directly.
 */
const useAuth = () => {
  const { user, isAuthenticated, accessToken, login, logout: logoutStore } = useAuthStore();

  const logout = async () => {
    try {
      await logoutApi(); // revoke refresh token on backend
    } catch {
      // Ignore — still clear local state
    } finally {
      logoutStore();
    }
  };

  return { user, isAuthenticated, accessToken, login, logout };
};

export default useAuth;