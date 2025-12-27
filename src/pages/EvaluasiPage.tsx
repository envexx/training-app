import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';

import './EvaluasiPage.css';

export const EvaluasiPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <div className="page-wrapper">
        <PageHeader 
          title="Evaluasi Pasca Pelatihan" 
          subtitle="Data evaluasi setelah pelatihan"
          icon="fas fa-star"
          iconColor="linear-gradient(135deg, #FF9500 0%, #FFB84D 100%)"
        />

        <div className="page-content">
          <div className="menu-section">
            <h2 className="section-title">Evaluasi</h2>
            <div className="menu-grid">
              <div className="menu-card" onClick={() => navigate('/form-evaluasi')}>
                <div className="menu-card-icon" style={{ backgroundColor: '#FF9500' }}>
                  <i className="fas fa-edit"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Evaluasi Baru</h3>
                  <p className="menu-card-subtitle">Total: 8 evaluasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#34C759' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Evaluasi Selesai</h3>
                  <p className="menu-card-subtitle">Total: 12 evaluasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#4A90E2' }}>
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Laporan Evaluasi</h3>
                  <p className="menu-card-subtitle">Lihat laporan evaluasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="menu-section">
            <h2 className="section-title">Metrik Evaluasi</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#FF9500' }}>
                  <i className="fas fa-star"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">4.5</div>
                  <div className="metric-label">Rating Rata-rata</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#34C759' }}>
                  <i className="fas fa-thumbs-up"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">92%</div>
                  <div className="metric-label">Kepuasan</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#4A90E2' }}>
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-value">145</div>
                  <div className="metric-label">Peserta Evaluasi</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};
