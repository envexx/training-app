import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { statisticsAPI } from '@/services/api';

import './Dashboard.css';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
}

interface Statistics {
  counts: {
    requirement: number;
    terapis: number;
    tna: number;
    evaluasi: number;
    training: number;
  };
  charts: {
    tnaByMonth: Array<{ month: string; count: number }>;
    evaluasiByMonth: Array<{ month: string; count: number }>;
    terapisByStatus: Array<{ status: string; count: number }>;
  };
}

export const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await statisticsAPI.getStatistics();
        if (response.success && response.data) {
          setStatistics(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat statistik');
        console.error('Error loading statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

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
      title: 'Data Requirement',
      subtitle: 'Kelola data requirement terapis',
      icon: 'fas fa-user-plus',
      route: '/data-requirement',
      color: '#FF9500',
    },
    {
      id: '3',
      title: 'Data Terapis',
      subtitle: 'Kelola data terapis',
      icon: 'fas fa-user-md',
      route: '/data-terapis',
      color: '#20B2AA',
    },
    {
      id: '4',
      title: 'Data Training',
      subtitle: 'Kelola data pelatihan',
      icon: 'fas fa-graduation-cap',
      route: '/data-training',
      color: '#34C759',
    },
    {
      id: '5',
      title: 'Form Analisa Kebutuhan Training',
      subtitle: 'Training Need Analysis (TNA)',
      icon: 'fas fa-clipboard-list',
      route: '/tna',
      color: '#7B68EE',
    },
    {
      id: '6',
      title: 'Evaluasi Pasca Pelatihan',
      subtitle: 'Data evaluasi setelah pelatihan',
      icon: 'fas fa-star',
      route: '/evaluasi',
      color: '#E91E63',
    },
    {
      id: '7',
      title: 'Setting',
      subtitle: 'Pengaturan aplikasi',
      icon: 'fas fa-cog',
      route: '/setting',
      color: '#666',
    },
  ];

  const stats = statistics ? [
    { label: 'Data Requirement', value: statistics.counts.requirement.toString(), icon: 'fas fa-user-plus', color: '#FF9500' },
    { label: 'Data Terapis', value: statistics.counts.terapis.toString(), icon: 'fas fa-user-md', color: '#20B2AA' },
    { label: 'Form TNA', value: statistics.counts.tna.toString(), icon: 'fas fa-file-alt', color: '#7B68EE' },
    { label: 'Evaluasi', value: statistics.counts.evaluasi.toString(), icon: 'fas fa-star', color: '#E91E63' },
    { label: 'Training Modules', value: statistics.counts.training.toString(), icon: 'fas fa-graduation-cap', color: '#34C759' },
  ] : [
    { label: 'Data Requirement', value: '0', icon: 'fas fa-user-plus', color: '#FF9500' },
    { label: 'Data Terapis', value: '0', icon: 'fas fa-user-md', color: '#20B2AA' },
    { label: 'Form TNA', value: '0', icon: 'fas fa-file-alt', color: '#7B68EE' },
    { label: 'Evaluasi', value: '0', icon: 'fas fa-star', color: '#E91E63' },
    { label: 'Training Modules', value: '0', icon: 'fas fa-graduation-cap', color: '#34C759' },
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
          {error && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Memuat statistik...</p>
            </div>
          ) : (
            <>
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

              {/* Charts Section */}
              {statistics && (
                <div className="charts-section">
                  <div className="chart-card">
                    <h3 className="chart-title">TNA per Bulan (6 Bulan Terakhir)</h3>
                    <div className="chart-bars">
                      {statistics.charts.tnaByMonth.length > 0 ? (
                        statistics.charts.tnaByMonth.map((item, index) => {
                          const maxCount = Math.max(...statistics.charts.tnaByMonth.map(i => i.count), 1);
                          const height = (item.count / maxCount) * 100;
                          const monthName = new Date(item.month).toLocaleDateString('id-ID', { month: 'short' });
                          return (
                            <div key={index} className="chart-bar-item">
                              <div className="chart-bar-wrapper">
                                <div 
                                  className="chart-bar" 
                                  style={{ height: `${height}%`, backgroundColor: '#7B68EE' }}
                                  title={`${monthName}: ${item.count}`}
                                >
                                  <span className="chart-bar-value">{item.count}</span>
                                </div>
                              </div>
                              <div className="chart-bar-label">{monthName}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="chart-empty">Belum ada data</div>
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">Evaluasi per Bulan (6 Bulan Terakhir)</h3>
                    <div className="chart-bars">
                      {statistics.charts.evaluasiByMonth.length > 0 ? (
                        statistics.charts.evaluasiByMonth.map((item, index) => {
                          const maxCount = Math.max(...statistics.charts.evaluasiByMonth.map(i => i.count), 1);
                          const height = (item.count / maxCount) * 100;
                          const monthName = new Date(item.month).toLocaleDateString('id-ID', { month: 'short' });
                          return (
                            <div key={index} className="chart-bar-item">
                              <div className="chart-bar-wrapper">
                                <div 
                                  className="chart-bar" 
                                  style={{ height: `${height}%`, backgroundColor: '#E91E63' }}
                                  title={`${monthName}: ${item.count}`}
                                >
                                  <span className="chart-bar-value">{item.count}</span>
                                </div>
                              </div>
                              <div className="chart-bar-label">{monthName}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="chart-empty">Belum ada data</div>
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">Status Terapis</h3>
                    <div className="chart-pie">
                      {statistics.charts.terapisByStatus.length > 0 ? (
                        statistics.charts.terapisByStatus.map((item, index) => {
                          const total = statistics.charts.terapisByStatus.reduce((sum, i) => sum + i.count, 0);
                          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                          return (
                            <div key={index} className="chart-pie-item">
                              <div className="chart-pie-color" style={{ backgroundColor: ['#20B2AA', '#34C759', '#FF9500'][index % 3] }}></div>
                              <div className="chart-pie-label">{item.status}</div>
                              <div className="chart-pie-value">{item.count} ({percentage}%)</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="chart-empty">Belum ada data</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

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
