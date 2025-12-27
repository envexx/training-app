import type { FC } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dashboard } from '@/components/Dashboard/Dashboard.tsx';
import { AdminDashboard } from '@/components/AdminDashboard/AdminDashboard.tsx';
import { useAuth } from '@/contexts/AuthContext';

export const IndexPage: FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#F8F9FA'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#4A90E2' }}></i>
          <p style={{ marginTop: '16px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if user is admin
  // Check both roleName and role.name (depending on API response format)
  const userRole = user?.roleName || (user as any)?.role?.name || '';
  if (userRole.toLowerCase() === 'admin') {
    return <AdminDashboard />;
  }

  // Show regular dashboard for other roles
  return <Dashboard />;
};
