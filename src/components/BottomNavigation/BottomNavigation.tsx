import { useNavigate, useLocation } from 'react-router-dom';
import type { FC } from 'react';

import './BottomNavigation.css';

export const BottomNavigation: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
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

