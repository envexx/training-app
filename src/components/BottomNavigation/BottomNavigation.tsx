import { useNavigate, useLocation } from 'react-router-dom';
import type { FC } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import './BottomNavigation.css';

export const BottomNavigation: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Check if user is admin
  const userRole = user?.roleName || (user as any)?.role?.name || '';
  const isAdmin = userRole.toLowerCase() === 'admin';

  const navItems = isAdmin
    ? [
        { path: '/', icon: 'fas fa-home', label: 'Dashboard' },
        { path: '/admin/users', icon: 'fas fa-users-cog', label: 'Users' },
        { path: '/data-terapis', icon: 'fas fa-user-md', label: 'Terapis' },
        { path: '/data-training', icon: 'fas fa-graduation-cap', label: 'Training' },
        { path: '/setting', icon: 'fas fa-cog', label: 'Setting' },
      ]
    : [
        { path: '/', icon: 'fas fa-home', label: 'Dashboard' },
        { path: '/data-training', icon: 'fas fa-graduation-cap', label: 'Training' },
        { path: '/tna', icon: 'fas fa-clipboard-list', label: 'TNA' },
        { path: '/evaluasi', icon: 'fas fa-star', label: 'Evaluasi' },
        { path: '/setting', icon: 'fas fa-cog', label: 'Setting' },
      ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <i className={item.icon}></i>
          </button>
        );
      })}
    </nav>
  );
};

