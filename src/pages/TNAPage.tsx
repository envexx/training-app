import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';

import './TNAPage.css';

export const TNAPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <div className="page-wrapper">
        <PageHeader 
          title="Form Analisa Kebutuhan Training" 
          subtitle="Training Need Analysis (TNA)"
          icon="fas fa-clipboard-list"
          iconColor="linear-gradient(135deg, #7B68EE 0%, #9B7EE8 100%)"
        />

        <div className="page-content">
          <div className="menu-section">
            <h2 className="section-title">Form TNA</h2>
            <div className="menu-grid">
              <div className="menu-card" onClick={() => navigate('/form-tna')}>
                <div className="menu-card-icon" style={{ backgroundColor: '#7B68EE' }}>
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Buat Form TNA Baru</h3>
                  <p className="menu-card-subtitle">Form analisa kebutuhan training</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#4A90E2' }}>
                  <i className="fas fa-list"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Daftar Form TNA</h3>
                  <p className="menu-card-subtitle">Total: 15 form</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#34C759' }}>
                  <i className="fas fa-check-double"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Form TNA Selesai</h3>
                  <p className="menu-card-subtitle">Total: 10 form</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#FF9500' }}>
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Form TNA Pending</h3>
                  <p className="menu-card-subtitle">Total: 5 form</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="menu-section">
            <h2 className="section-title">Kategori Analisa</h2>
            <div className="category-grid">
              <div className="category-item">
                <i className="fas fa-user-check"></i>
                <span>Kebutuhan Individu</span>
              </div>
              <div className="category-item">
                <i className="fas fa-users"></i>
                <span>Kebutuhan Tim</span>
              </div>
              <div className="category-item">
                <i className="fas fa-building"></i>
                <span>Kebutuhan Organisasi</span>
              </div>
              <div className="category-item">
                <i className="fas fa-briefcase"></i>
                <span>Kebutuhan Pekerjaan</span>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};
