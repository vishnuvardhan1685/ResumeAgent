import React from 'react';
import { Navigate } from 'react-router-dom';
import { Bot, Zap, BarChart2, Compass } from 'lucide-react';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import useAuthStore from '../store/authStore';

const FEATURES = [
  { icon: Zap, label: 'AI skill extraction from PDF resumes' },
  { icon: BarChart2, label: 'Match scoring with dimensional radar analysis' },
  { icon: Compass, label: 'Live job discovery from Google & Internshala' },
];

const LoginPage = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/resumes" replace />;

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
            <Bot size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">AgenticAI</h1>
          <p className="text-sm text-text-secondary mt-1">Resume Analysis v2.4</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-7">
          <h2 className="text-base font-semibold text-text-primary mb-1">Sign in to continue</h2>
          <p className="text-sm text-text-secondary mb-6">
            AI-powered resume matching and interview prep.
          </p>

          <GoogleLoginButton />

          {/* Feature list */}
          <ul className="mt-7 space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon size={12} className="text-accent" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          By signing in you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;