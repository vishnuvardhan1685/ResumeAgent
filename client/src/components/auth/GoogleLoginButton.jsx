import React, { useState, useEffect, useRef } from 'react';
import Spinner from '../ui/Spinner';
import useAuthStore from '../../store/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((s) => s.login);
  const gsiInitialized = useRef(false);

  // Called by GSI after user picks a Google account
  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError(null);
    try {
      // Use relative URL — Vite proxy forwards /api/* to localhost:5000
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message ?? `Server error: ${res.status}`);
      }
      const data = await res.json();
      login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      console.error('[GoogleLoginButton] Login failed:', err);
      setError(err.message ?? 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initGSI = () => {
    if (!window.google || gsiInitialized.current) return;
    gsiInitialized.current = true;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      use_fedcm_for_prompt: true,
    });
  };

  useEffect(() => {
    if (gsiInitialized.current || !GOOGLE_CLIENT_ID) return;
    const scriptId = 'google-gsi-script';
    if (document.getElementById(scriptId)) { initGSI(); return; }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGSI;
    script.onerror = () => setError('Failed to load Google Sign-In.');
    document.head.appendChild(script);
  }, []);

  const renderFallbackButton = () => {
    const container = document.getElementById('gsi-fallback-button');
    if (!container || !window.google) return;
    window.google.accounts.id.renderButton(container, {
      type: 'standard', theme: 'filled_black', size: 'large',
      width: container.offsetWidth || 320,
    });
    container.style.display = 'block';
  };

  const handleClick = () => {
    if (loading || !GOOGLE_CLIENT_ID || !window.google) return;
    setError(null);
    setLoading(true);
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
        setLoading(false);
        if (notification.isNotDisplayed()) renderFallbackButton();
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center w-full gap-3 px-6 text-sm font-medium transition-all duration-150 border h-11 rounded-xl bg-elevated border-border hover:border-border-active text-text-primary disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? <Spinner size={16} /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.6 20.5H42V20H24v8h11.3C33.6 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.4 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#FFC107"/>
            <path d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.4 6.5 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" fill="#FF3D00"/>
            <path d="M24 44c5.3 0 10.1-2 13.7-5.2l-6.3-5.3C29.5 35.5 26.9 36 24 36c-5.3 0-9.6-3.4-11.3-8H6.2C9.5 35.6 16.2 44 24 44z" fill="#4CAF50"/>
            <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C37.2 39.4 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
          </svg>
        )}
        {loading ? 'Signing in…' : 'Continue with Google'}
      </button>
      <div id="gsi-fallback-button" className="hidden w-full overflow-hidden rounded-xl" />
      {error && <p className="text-xs text-center text-red-400">{error}</p>}
      {!GOOGLE_CLIENT_ID && (
        <p className="px-3 py-2 text-xs text-center border rounded-lg text-amber-400 bg-amber-500/10 border-amber-500/20">
          ⚠ VITE_GOOGLE_CLIENT_ID not set in .env
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;