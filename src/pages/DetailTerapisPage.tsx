import { useState, useEffect, type FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { terapisAPI, tnaAPI, evaluasiAPI } from '@/services/api';
import { formatDateLocale } from '@/utils/dateUtils';

import './DetailTerapisPage.css';

interface Terapis {
  id: string;
  nama: string;
  lulusan: string;
  tanggal_requirement?: string;
  tanggalRequirement?: string;
  cabang?: string;
  mulai_kontrak?: string;
  mulaiKontrak?: string;
  end_kontrak?: string;
  endKontrak?: string;
  alamat?: string;
  no_telp?: string;
  noTelp?: string;
  email?: string;
}

export const DetailTerapisPage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const terapisId = id;

  const [terapis, setTerapis] = useState<Terapis | null>(null);
  const [tnaData, setTnaData] = useState<any | null>(null);
  const [evaluasiData, setEvaluasiData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!terapisId) {
      navigate('/data-terapis');
      return;
    }

    loadTerapisData();
  }, [terapisId, navigate]);

  const loadTerapisData = async () => {
    if (!terapisId) {
      navigate('/data-terapis');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Load terapis data
      const terapisResponse = await terapisAPI.getById(terapisId);
      if (terapisResponse.success && terapisResponse.data) {
        // Backend returns: { success: true, data: { id, nama, ... } }
        setTerapis(terapisResponse.data);
      } else {
        throw new Error('Data terapis tidak ditemukan');
      }

      // Load TNA data
      try {
        const tnaResponse = await tnaAPI.getByTerapisId(terapisId);
        if (tnaResponse.success && tnaResponse.data) {
          const tna = tnaResponse.data.tna || tnaResponse.data;
          setTnaData(tna);
        }
      } catch (err) {
        // TNA not found is OK
        setTnaData(null);
      }

      // Load Evaluasi data
      try {
        const evaluasiResponse = await evaluasiAPI.getByTerapisId(terapisId);
        if (evaluasiResponse.success && evaluasiResponse.data) {
          const evaluasi = evaluasiResponse.data.evaluasi || evaluasiResponse.data;
          setEvaluasiData(evaluasi);
        }
      } catch (err) {
        // Evaluasi not found is OK
        setEvaluasiData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data terapis');
      console.error('Error loading terapis:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader
            title="Detail Terapis"
            subtitle="Memuat data..."
            icon="fas fa-user-md"
            iconColor="linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)"
          />
          <div className="page-content">
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Memuat data terapis...</p>
            </div>
          </div>
          <BottomNavigation />
        </div>
      </Page>
    );
  }

  if (!terapis || error) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader
            title="Detail Terapis"
            subtitle="Error"
            icon="fas fa-user-md"
            iconColor="linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)"
          />
          <div className="page-content">
            <div className="error-state">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error || 'Data terapis tidak ditemukan'}</p>
              <button className="btn btn-primary" onClick={() => navigate('/data-terapis')}>
                Kembali ke Data Terapis
              </button>
            </div>
          </div>
          <BottomNavigation />
        </div>
      </Page>
    );
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
                  <div>{formatDateLocale(terapis.tanggal_requirement || terapis.tanggalRequirement)}</div>
                </div>
                {terapis.cabang && (
                  <div className="detail-grid-item">
                    <label>Cabang</label>
                    <div>{terapis.cabang}</div>
                  </div>
                )}
                {(terapis.mulai_kontrak || terapis.mulaiKontrak) && (
                  <div className="detail-grid-item">
                    <label>Mulai Kontrak</label>
                    <div>{formatDateLocale(terapis.mulai_kontrak || terapis.mulaiKontrak)}</div>
                  </div>
                )}
                {(terapis.end_kontrak || terapis.endKontrak) && (
                  <div className="detail-grid-item">
                    <label>End Kontrak</label>
                    <div>{formatDateLocale(terapis.end_kontrak || terapis.endKontrak)}</div>
                  </div>
                )}
                {(terapis.no_telp || terapis.noTelp) && (
                  <div className="detail-grid-item">
                    <label>No. Telepon</label>
                    <div>{terapis.no_telp || terapis.noTelp}</div>
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
                    <div>{tnaData.no_dokumen || tnaData.noDokumen}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Revisi Ke-</label>
                    <div>{tnaData.revisi}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Tgl. Berlaku</label>
                    <div>{new Date(tnaData.tgl_berlaku || tnaData.tglBerlaku || '').toLocaleDateString('id-ID')}</div>
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
                    <span>Total Training: {(tnaData.training_rows || tnaData.trainingRows || []).length}</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-calendar"></i>
                    <span>Dibuat: {new Date(tnaData.created_at || tnaData.createdAt || '').toLocaleDateString('id-ID')}</span>
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
                    <div>{evaluasiData.no_dokumen || evaluasiData.noDokumen}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Revisi Ke-</label>
                    <div>{evaluasiData.revisi}</div>
                  </div>
                  <div className="form-data-item">
                    <label>Tgl. Berlaku</label>
                    <div>{new Date(evaluasiData.tgl_berlaku || evaluasiData.tglBerlaku || '').toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div className="form-data-row">
                  <div className="form-data-item">
                    <label>Nama Pelatihan</label>
                    <div>{evaluasiData.nama_pelatihan || evaluasiData.namaPelatihan || '-'}</div>
                  </div>
                  {(evaluasiData.tgl_pelaksanaan || evaluasiData.tglPelaksanaan) && (
                    <div className="form-data-item">
                      <label>Tgl. Pelaksanaan</label>
                      <div>{new Date(evaluasiData.tgl_pelaksanaan || evaluasiData.tglPelaksanaan).toLocaleDateString('id-ID')}</div>
                    </div>
                  )}
                </div>
                <div className="form-data-summary">
                  <div className="summary-item">
                    <i className="fas fa-list-check"></i>
                    <span>Tujuan: {(evaluasiData.tujuan_pelatihan || evaluasiData.tujuanPelatihan || []).filter((t: string) => t && t.trim()).length} item</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-chart-line"></i>
                    <span>Proficiency: {(evaluasiData.proficiency_rows || evaluasiData.proficiencyRows || []).length} item</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-calendar"></i>
                    <span>Dibuat: {new Date(evaluasiData.created_at || evaluasiData.createdAt).toLocaleDateString('id-ID')}</span>
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

