import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { useAuth } from '@/contexts/AuthContext';

import './AdminDashboard.css';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
}

export const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Kelola User',
      subtitle: 'Manage semua user & supervisor',
      icon: 'fas fa-users-cog',
      route: '/admin/users',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: 'Kelola Role',
      subtitle: 'Buat & edit role custom',
      icon: 'fas fa-user-shield',
      route: '/admin/roles',
      color: '#7B68EE',
    },
    {
      id: '3',
      title: 'Data Terapis',
      subtitle: 'Lihat semua data terapis',
      icon: 'fas fa-user-md',
      route: '/data-terapis',
      color: '#20B2AA',
    },
    {
      id: '4',
      title: 'Data Requirement',
      subtitle: 'Lihat semua requirement',
      icon: 'fas fa-user-plus',
      route: '/data-requirement',
      color: '#FF9500',
    },
    {
      id: '5',
      title: 'Data Training',
      subtitle: 'Lihat semua jadwal training',
      icon: 'fas fa-graduation-cap',
      route: '/data-training',
      color: '#34C759',
    },
    {
      id: '6',
      title: 'Form TNA',
      subtitle: 'Lihat semua form TNA',
      icon: 'fas fa-clipboard-list',
      route: '/tna',
      color: '#7B68EE',
    },
    {
      id: '7',
      title: 'Evaluasi',
      subtitle: 'Lihat semua evaluasi',
      icon: 'fas fa-star',
      route: '/evaluasi',
      color: '#E91E63',
    },
    {
      id: '8',
      title: 'Audit Log',
      subtitle: 'Lihat log aktivitas semua user',
      icon: 'fas fa-history',
      route: '/admin/audit',
      color: '#FF6B6B',
    },
    {
      id: '9',
      title: 'Setting',
      subtitle: 'Pengaturan sistem',
      icon: 'fas fa-cog',
      route: '/setting',
      color: '#666',
    },
  ];

  const stats = [
    { label: 'Total User', value: '0', icon: 'fas fa-users', color: '#4A90E2' },
    { label: 'Total Terapis', value: '0', icon: 'fas fa-user-md', color: '#20B2AA' },
    { label: 'Total Training', value: '0', icon: 'fas fa-book', color: '#34C759' },
    { label: 'Total TNA', value: '0', icon: 'fas fa-file-alt', color: '#7B68EE' },
  ];

  return (
    <Page back={false}>
      <div className="spendly-dashboard admin-dashboard">
        <PageHeader 
          title="Admin Dashboard" 
          subtitle={`Welcome, ${user?.fullName || user?.username || 'Admin'}`}
          icon="fas fa-user-shield"
          iconColor="linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)"
        />

        <div className="spendly-content">
          {/* Stats Overview */}
          <div className="stats-overview">
            {stats.map((stat, index) => (
              <div key={index} className="stat-box">
                <div className="stat-box-icon" style={{ backgroundColor: stat.color }}>
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-box-content">
                  <div className="stat-box-value">{stat.value}</div>
                  <div className="stat-box-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Menu Items */}
          <div className="menu-section">
            <h2 className="section-title">Menu Admin</h2>
            <div className="menu-grid">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="menu-card"
                  onClick={() => navigate(item.route)}
                >
                  <div className="menu-card-icon" style={{ backgroundColor: item.color }}>
                    <i className={item.icon}></i>
                  </div>
                  <div className="menu-card-content">
                    <h3 className="menu-card-title">{item.title}</h3>
                    <p className="menu-card-subtitle">{item.subtitle}</p>
                  </div>
                  <div className="menu-card-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};

