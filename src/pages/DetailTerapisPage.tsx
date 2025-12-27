import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { dataStore } from '@/store/dataStore';

import './DetailTerapisPage.css';

interface Terapis {
  id: string;
  nama: string;
  lulusan: string;
  tanggalRequirement: string;
  mulaiKontrak?: string;
  endKontrak?: string;
  alamat?: string;
  noTelp?: string;
  email?: string;
}

const STORAGE_KEY = 'terapis_list';

export const DetailTerapisPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const terapisId = searchParams.get('id');

  const [terapis, setTerapis] = useState<Terapis | null>(null);
  const [tnaData, setTnaData] = useState(dataStore.getTNAByTerapis(terapisId || ''));
  const [evaluasiData, setEvaluasiData] = useState(dataStore.getEvaluasiByTerapis(terapisId || ''));

  useEffect(() => {
    if (!terapisId) {
      navigate('/data-terapis');
      return;
    }

    const terapisList: Terapis[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const found = terapisList.find((t) => t.id === terapisId);
    
    if (!found) {
      alert('Data terapis tidak ditemukan');
      navigate('/data-terapis');
      return;
    }

    setTerapis(found);
    setTnaData(dataStore.getTNAByTerapis(terapisId));
    setEvaluasiData(dataStore.getEvaluasiByTerapis(terapisId));
  }, [terapisId, navigate]);

  const handleEditTerapis = () => {
    navigate(`/data-terapis?edit=${terapisId}`);
  };

  const handleCreateTNA = () => {
    navigate(`/form-tna?terapisId=${terapisId}`);
  };

  const handleEditTNA = () => {
    if (tnaData) {
      navigate(`/form-tna?terapisId=${terapisId}&id=${tnaData.id}`);
    }
  };

  const handleCreateEvaluasi = () => {
    navigate(`/form-evaluasi?terapisId=${terapisId}`);
  };

  const handleEditEvaluasi = () => {
    if (evaluasiData) {
      navigate(`/form-evaluasi?terapisId=${terapisId}&id=${evaluasiData.id}`);
    }
  };

  if (!terapis) {
    return null;
  }

  return (
    <Page>
      <div className="page-wrapper">
        <PageHeader 
          title="Detail Terapis" 
          subtitle={terapis.nama}
          icon="fas fa-user-md"
          iconColor="linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)"
        />

        <div className="page-content">
          {/* Data Terapis */}
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Data Terapis</h2>
              <button className="btn btn-primary btn-small" onClick={handleEditTerapis}>
                <i className="fas fa-edit"></i> Edit
              </button>
            </div>

            <div className="terapis-detail-card">
              <div className="terapis-detail-header">
                <div className="terapis-avatar-large">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="terapis-detail-info">
                  <h3 className="terapis-name-large">{terapis.nama}</h3>
                  <p className="terapis-lulusan-large">{terapis.lulusan}</p>
                </div>
              </div>

              <div className="terapis-detail-grid">
                <div className="detail-grid-item">
                  <label>Tanggal Requirement</label>
                  <div>{new Date(terapis.tanggalRequirement).toLocaleDateString('id-ID')}</div>
                </div>
                {terapis.mulaiKontrak && (
                  <div className="detail-grid-item">
                    <label>Mulai Kontrak</label>
                    <div>{new Date(terapis.mulaiKontrak).toLocaleDateString('id-ID')}</div>
                  </div>
                )}
                {terapis.endKontrak && (
                  <div className="detail-grid-item">
                    <label>End Kontrak</label>
                    <div>{new Date(terapis.endKontrak).toLocaleDateString('id-ID')}</div>
                  </div>
                )}
                {terapis.noTelp && (
                  <div className="detail-grid-item">
                    <label>No. Telepon</label>
                    <div>{terapis.noTelp}</div>
                  </div>
                )}
                {terapis.email && (
                  <div className="detail-grid-item">
                    <label>Email</label>
                    <div>{terapis.email}</div>
                  </div>
                )}
                {terapis.alamat && (
                  <div className="detail-grid-item full-width">
                    <label>Alamat</label>
                    <div>{terapis.alamat}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabel TNA */}
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Form Analisis Kebutuhan Training (TNA)</h2>
              {tnaData ? (
                <button className="btn btn-primary btn-small" onClick={handleEditTNA}>
                  <i className="fas fa-edit"></i> Edit TNA
                </button>
              ) : (
                <button className="btn btn-primary btn-small" onClick={handleCreateTNA}>
                  <i className="fas fa-plus"></i> Buat TNA
                </button>
              )}
            </div>

            {tnaData ? (
              <div className="form-data-card">
                <div className="form-data-row">
                  <div className="form-data-item">
                    <label>No. Dokumen</label>
                    <div>{tnaData.noDokumen}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Revisi Ke-</label>
                    <div>{tnaData.revisi}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Tgl. Berlaku</label>
                    <div>{new Date(tnaData.tglBerlaku).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div className="form-data-row">
                  <div className="form-data-item">
                    <label>Unit</label>
                    <div>{tnaData.unit}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Departement</label>
                    <div>{tnaData.departement}</div>
                  </div>
                </div>
                <div className="form-data-summary">
                  <div className="summary-item">
                    <i className="fas fa-list"></i>
                    <span>Total Training: {tnaData.trainingRows.length}</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-calendar"></i>
                    <span>Dibuat: {new Date(tnaData.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-form-state">
                <i className="fas fa-clipboard-list"></i>
                <p>Belum ada data TNA untuk terapis ini</p>
                <button className="btn btn-primary" onClick={handleCreateTNA}>
                  Buat Form TNA
                </button>
              </div>
            )}
          </div>

          {/* Tabel Evaluasi */}
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Evaluasi Pasca Pelatihan</h2>
              {evaluasiData ? (
                <button className="btn btn-primary btn-small" onClick={handleEditEvaluasi}>
                  <i className="fas fa-edit"></i> Edit Evaluasi
                </button>
              ) : (
                <button className="btn btn-primary btn-small" onClick={handleCreateEvaluasi}>
                  <i className="fas fa-plus"></i> Buat Evaluasi
                </button>
              )}
            </div>

            {evaluasiData ? (
              <div className="form-data-card">
                <div className="form-data-row">
                  <div className="form-data-item">
                    <label>No. Dokumen</label>
                    <div>{evaluasiData.noDokumen}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Revisi Ke-</label>
                    <div>{evaluasiData.revisi}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Tgl. Berlaku</label>
                    <div>{new Date(evaluasiData.tglBerlaku).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div className="form-data-row">
                  <div className="form-data-item">
                    <label>Nama Pelatihan</label>
                    <div>{evaluasiData.namaPelatihan || '-'}</div>
                  </div>
                  {evaluasiData.tglPelaksanaan && (
                    <div className="form-data-item">
                      <label>Tgl. Pelaksanaan</label>
                      <div>{new Date(evaluasiData.tglPelaksanaan).toLocaleDateString('id-ID')}</div>
                    </div>
                  )}
                </div>
                <div className="form-data-summary">
                  <div className="summary-item">
                    <i className="fas fa-list-check"></i>
                    <span>Tujuan: {evaluasiData.tujuanPelatihan.filter((t) => t.trim()).length} item</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-chart-line"></i>
                    <span>Proficiency: {evaluasiData.proficiencyRows.length} item</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-calendar"></i>
                    <span>Dibuat: {new Date(evaluasiData.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-form-state">
                <i className="fas fa-star"></i>
                <p>Belum ada data Evaluasi untuk terapis ini</p>
                <button className="btn btn-primary" onClick={handleCreateEvaluasi}>
                  Buat Form Evaluasi
                </button>
              </div>
            )}
          </div>
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};

