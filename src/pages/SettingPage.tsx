import type { FC } from 'react';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';

import './SettingPage.css';

export const SettingPage: FC = () => {
  return (
    <Page>
      <div className="page-wrapper">
        <PageHeader 
          title="Setting" 
          subtitle="Pengaturan aplikasi"
          icon="fas fa-cog"
          iconColor="linear-gradient(135deg, #666 0%, #888 100%)"
        />

        <div className="page-content">
          <div className="menu-section">
            <h2 className="section-title">Akun</h2>
            <div className="menu-grid">
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#4A90E2' }}>
                  <i className="fas fa-user"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Profil</h3>
                  <p className="menu-card-subtitle">Kelola profil Anda</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#7B68EE' }}>
                  <i className="fas fa-key"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Keamanan</h3>
                  <p className="menu-card-subtitle">Ubah kata sandi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="menu-section">
            <h2 className="section-title">Aplikasi</h2>
            <div className="menu-grid">
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#34C759' }}>
                  <i className="fas fa-bell"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Notifikasi</h3>
                  <p className="menu-card-subtitle">Kelola notifikasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#FF9500' }}>
                  <i className="fas fa-palette"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Tampilan</h3>
                  <p className="menu-card-subtitle">Tema aplikasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#50C878' }}>
                  <i className="fas fa-language"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Bahasa</h3>
                  <p className="menu-card-subtitle">Bahasa aplikasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="menu-section">
            <h2 className="section-title">Lainnya</h2>
            <div className="menu-grid">
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#20B2AA' }}>
                  <i className="fas fa-question-circle"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Bantuan</h3>
                  <p className="menu-card-subtitle">Bantuan & FAQ</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#FF6B6B' }}>
                  <i className="fas fa-info-circle"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Tentang Aplikasi</h3>
                  <p className="menu-card-subtitle">Versi 1.0.0</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="menu-card">
                <div className="menu-card-icon" style={{ backgroundColor: '#999' }}>
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">Logout</h3>
                  <p className="menu-card-subtitle">Keluar dari aplikasi</p>
                </div>
                <div className="menu-card-arrow">
                  <i className="fas fa-chevron-right"></i>
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
