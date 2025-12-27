import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';

import './Dashboard.css';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
}

export const Dashboard: FC = () => {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Dashboard',
      subtitle: 'Overview & Statistik',
      icon: 'fas fa-home',
      route: '/',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: 'Data Terapis',
      subtitle: 'Kelola data terapis',
      icon: 'fas fa-user-md',
      route: '/data-terapis',
      color: '#20B2AA',
    },
    {
      id: '3',
      title: 'Data Training',
      subtitle: 'Kelola data pelatihan',
      icon: 'fas fa-graduation-cap',
      route: '/data-training',
      color: '#34C759',
    },
    {
      id: '4',
      title: 'Form Analisa Kebutuhan Training',
      subtitle: 'Training Need Analysis (TNA)',
      icon: 'fas fa-clipboard-list',
      route: '/tna',
      color: '#7B68EE',
    },
    {
      id: '5',
      title: 'Evaluasi Pasca Pelatihan',
      subtitle: 'Data evaluasi setelah pelatihan',
      icon: 'fas fa-star',
      route: '/evaluasi',
      color: '#FF9500',
    },
    {
      id: '6',
      title: 'Setting',
      subtitle: 'Pengaturan aplikasi',
      icon: 'fas fa-cog',
      route: '/setting',
      color: '#666',
    },
  ];

  const stats = [
    { label: 'Total Training', value: '23', icon: 'fas fa-book', color: '#4A90E2' },
    { label: 'Peserta Aktif', value: '156', icon: 'fas fa-users', color: '#34C759' },
    { label: 'Form TNA', value: '15', icon: 'fas fa-file-alt', color: '#7B68EE' },
    { label: 'Evaluasi', value: '20', icon: 'fas fa-star', color: '#FF9500' },
  ];

  return (
    <Page back={false}>
      <div className="spendly-dashboard">
        <PageHeader 
          title="Training App" 
          subtitle="Sistem Manajemen Pelatihan"
          icon="fas fa-rocket"
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

          {/* Menu Items */}
          <div className="menu-section">
            <h2 className="section-title">Menu Utama</h2>
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
