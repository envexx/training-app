import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { tnaAPI } from '@/services/api';
import { formatDateLocale } from '@/utils/dateUtils';

import './TNAPage.css';

interface TNAItem {
  id: string;
  terapisId: string;
  terapisNama: string;
  terapisLulusan: string;
  noDokumen: string;
  revisi: string;
  tglBerlaku: string;
  unit: string;
  departement: string;
  createdAt: string;
  updatedAt: string;
}

export const TNAPage: FC = () => {
  const navigate = useNavigate();
  const [tnaList, setTnaList] = useState<TNAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTNAList();
  }, [searchQuery]);

  const loadTNAList = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tnaAPI.getAll({ search: searchQuery || undefined });
      if (response.success && response.data) {
        setTnaList(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data TNA');
      console.error('Error loading TNA list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (tna: TNAItem) => {
    navigate(`/detail-terapis/${tna.terapisId}`);
  };

  const handleEdit = (tna: TNAItem) => {
    navigate(`/form-tna?terapisId=${tna.terapisId}&id=${tna.id}`);
  };

  const handleDelete = async (id: string, _terapisId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus form TNA ini?')) {
      return;
    }

    try {
      await tnaAPI.delete(id);
      alert('Form TNA berhasil dihapus');
      await loadTNAList();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus form TNA');
      console.error('Error deleting TNA:', err);
    }
  };

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
          {/* Action Button */}
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Form TNA</h2>
              <button className="btn btn-primary btn-add" onClick={() => navigate('/form-tna')}>
                <i className="fas fa-plus"></i> Buat Form TNA Baru
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
                placeholder="Cari berdasarkan No. Dokumen, Unit, Departement, atau Nama Terapis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* TNA List */}
          <div className="menu-section">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Memuat data TNA...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadTNAList}>Coba Lagi</button>
              </div>
            ) : tnaList.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clipboard-list"></i>
                <p>Belum ada data TNA</p>
                <button className="btn btn-primary" onClick={() => navigate('/form-tna')}>
                  Buat Form TNA Pertama
                </button>
              </div>
            ) : (
              <div className="tna-list">
                {tnaList.map((tna) => (
                  <div key={tna.id} className="tna-card">
                    <div className="tna-card-header">
                      <div className="tna-card-icon">
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div className="tna-card-info">
                        <h3 className="tna-card-title">{tna.noDokumen}</h3>
                        <p className="tna-card-subtitle">{tna.terapisNama} - {tna.terapisLulusan}</p>
                      </div>
                    </div>
                    <div className="tna-card-details">
                      <div className="detail-item">
                        <i className="fas fa-building"></i>
                        <span>Unit: {tna.unit}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-sitemap"></i>
                        <span>Departement: {tna.departement}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span>Tgl. Berlaku: {formatDateLocale(tna.tglBerlaku)}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <span>Dibuat: {formatDateLocale(tna.createdAt)}</span>
                      </div>
                    </div>
                    <div className="tna-card-actions">
                      <button className="btn-action btn-view" onClick={() => handleViewDetail(tna)}>
                        <i className="fas fa-eye"></i> Lihat Detail
                      </button>
                      <button className="btn-action btn-edit" onClick={() => handleEdit(tna)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(tna.id, tna.terapisId)}>
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
