import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-base">
      <div className="max-w-sm text-center">
        <p className="mb-4 font-bold select-none text-8xl text-border">404</p>
        <h1 className="mb-2 text-xl font-bold text-text-primary">Page not found</h1>
        <p className="mb-8 text-sm text-text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button variant="primary" icon={<Home size={14} />} onClick={() => navigate('/resumes')}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;