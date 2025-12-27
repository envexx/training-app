import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { evaluasiAPI } from '@/services/api';
import { formatDateLocale } from '@/utils/dateUtils';

import './EvaluasiPage.css';

interface EvaluasiItem {
  id: string;
  terapisId: string;
  terapisNama: string;
  terapisLulusan: string;
  noDokumen: string;
  revisi: string;
  tglBerlaku: string;
  nama: string;
  departemen: string;
  namaPelatihan: string;
  tglPelaksanaan: string;
  createdAt: string;
  updatedAt: string;
}

export const EvaluasiPage: FC = () => {
  const navigate = useNavigate();
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvaluasiList();
  }, [searchQuery]);

  const loadEvaluasiList = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await evaluasiAPI.getAll({ search: searchQuery || undefined });
      if (response.success && response.data) {
        setEvaluasiList(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data Evaluasi');
      console.error('Error loading Evaluasi list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (evaluasi: EvaluasiItem) => {
    navigate(`/detail-terapis/${evaluasi.terapisId}`);
  };

  const handleEdit = (evaluasi: EvaluasiItem) => {
    navigate(`/form-evaluasi?terapisId=${evaluasi.terapisId}&id=${evaluasi.id}`);
  };

  const handleDelete = async (id: string, terapisId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus form Evaluasi ini?')) {
      return;
    }

    try {
      await evaluasiAPI.delete(id);
      alert('Form Evaluasi berhasil dihapus');
      await loadEvaluasiList();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus form Evaluasi');
      console.error('Error deleting Evaluasi:', err);
    }
  };

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
          {/* Action Button */}
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Form Evaluasi</h2>
              <button className="btn btn-primary btn-add" onClick={() => navigate('/form-evaluasi')}>
                <i className="fas fa-plus"></i> Buat Form Evaluasi Baru
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="menu-section">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Cari berdasarkan No. Dokumen, Nama, Departemen, Nama Pelatihan, atau Nama Terapis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Evaluasi List */}
          <div className="menu-section">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Memuat data Evaluasi...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadEvaluasiList}>Coba Lagi</button>
              </div>
            ) : evaluasiList.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-star"></i>
                <p>Belum ada data Evaluasi</p>
                <button className="btn btn-primary" onClick={() => navigate('/form-evaluasi')}>
                  Buat Form Evaluasi Pertama
                </button>
              </div>
            ) : (
              <div className="evaluasi-list">
                {evaluasiList.map((evaluasi) => (
                  <div key={evaluasi.id} className="evaluasi-card">
                    <div className="evaluasi-card-header">
                      <div className="evaluasi-card-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="evaluasi-card-info">
                        <h3 className="evaluasi-card-title">{evaluasi.noDokumen}</h3>
                        <p className="evaluasi-card-subtitle">{evaluasi.terapisNama} - {evaluasi.terapisLulusan}</p>
                      </div>
                    </div>
                    <div className="evaluasi-card-details">
                      <div className="detail-item">
                        <i className="fas fa-user"></i>
                        <span>Nama: {evaluasi.nama}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-sitemap"></i>
                        <span>Departemen: {evaluasi.departemen}</span>
                      </div>
                      {evaluasi.namaPelatihan && (
                        <div className="detail-item">
                          <i className="fas fa-graduation-cap"></i>
                          <span>Pelatihan: {evaluasi.namaPelatihan}</span>
                        </div>
                      )}
                      {evaluasi.tglPelaksanaan && (
                        <div className="detail-item">
                          <i className="fas fa-calendar-alt"></i>
                          <span>Tgl. Pelaksanaan: {formatDateLocale(evaluasi.tglPelaksanaan)}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span>Tgl. Berlaku: {formatDateLocale(evaluasi.tglBerlaku)}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <span>Dibuat: {formatDateLocale(evaluasi.createdAt)}</span>
                      </div>
                    </div>
                    <div className="evaluasi-card-actions">
                      <button className="btn-action btn-view" onClick={() => handleViewDetail(evaluasi)}>
                        <i className="fas fa-eye"></i> Lihat Detail
                      </button>
                      <button className="btn-action btn-edit" onClick={() => handleEdit(evaluasi)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(evaluasi.id, evaluasi.terapisId)}>
                        <i className="fas fa-trash"></i> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};
