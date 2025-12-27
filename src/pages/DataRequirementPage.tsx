import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { requirementAPI } from '@/services/api';
import { formatDateLocale } from '@/utils/dateUtils';

import './DataRequirementPage.css';

interface Requirement {
  id: string;
  nama: string;
  lulusan: string;
  jurusan: string;
  tanggalRequirement: string;
}

export const DataRequirementPage: FC = () => {
  const navigate = useNavigate();
  const [requirementList, setRequirementList] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Requirement>>({
    nama: '',
    lulusan: '',
    jurusan: '',
    tanggalRequirement: '',
  });

  // Load requirements from API
  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await requirementAPI.getAll();
      if (response.success && response.data.requirements) {
        setRequirementList(response.data.requirements);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data requirement');
      console.error('Error loading requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      nama: '',
      lulusan: '',
      jurusan: '',
      tanggalRequirement: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi required fields
    if (!formData.nama || !formData.lulusan || !formData.jurusan || !formData.tanggalRequirement) {
      alert('Semua field wajib diisi!');
      return;
    }

    try {
      await requirementAPI.create({
        nama: formData.nama,
        lulusan: formData.lulusan,
        jurusan: formData.jurusan,
        tanggalRequirement: formData.tanggalRequirement,
      });

      alert('Requirement berhasil ditambahkan');
      await loadRequirements();

      setShowForm(false);
      setFormData({
        nama: '',
        lulusan: '',
        jurusan: '',
        tanggalRequirement: '',
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan requirement');
      console.error('Error saving requirement:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      nama: '',
      lulusan: '',
      jurusan: '',
      tanggalRequirement: '',
    });
  };

  const [showCabangModal, setShowCabangModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [selectedCabang, setSelectedCabang] = useState<string>('');

  const handleTerima = async (requirement: Requirement) => {
    // Show modal to select cabang
    setSelectedRequirement(requirement);
    setSelectedCabang('');
    setShowCabangModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedRequirement) return;

    try {
      const response = await requirementAPI.accept(selectedRequirement.id, selectedCabang || undefined);
      if (response.success) {
        const terapisId = response.data?.terapis?.id;
        alert(`${selectedRequirement.nama} telah diterima dan dipindahkan ke Data Terapis.`);
        await loadRequirements();
        setShowCabangModal(false);
        setSelectedRequirement(null);
        setSelectedCabang('');
        
        // Navigate to terapis detail if ID is available
        if (terapisId) {
          if (confirm('Apakah Anda ingin melihat detail terapis yang baru dibuat?')) {
            navigate(`/detail-terapis/${terapisId}`);
          }
        }
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menerima requirement');
      console.error('Error accepting requirement:', err);
    }
  };

  const handleTidakTerima = async (requirement: Requirement) => {
    if (!confirm(`Apakah Anda yakin tidak menerima ${requirement.nama}? Data akan dihapus.`)) {
      return;
    }

    try {
      await requirementAPI.reject(requirement.id);
      alert(`${requirement.nama} telah ditolak dan dihapus dari daftar requirement.`);
      await loadRequirements();
    } catch (err: any) {
      alert(err.message || 'Gagal menolak requirement');
      console.error('Error rejecting requirement:', err);
    }
  };

  if (showForm) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader 
            title="Tambah Data Requirement" 
            subtitle="Tambah requirement baru"
            icon="fas fa-user-plus"
            iconColor="linear-gradient(135deg, #FF9500 0%, #FFB84D 100%)"
          />

          <div className="page-content">
            <form onSubmit={handleSubmit} className="requirement-form">
              <div className="form-group">
                <label className="form-label">
                  Nama <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lulusan <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lulusan}
                  onChange={(e) => setFormData({ ...formData, lulusan: e.target.value })}
                  placeholder="Contoh: S1, S2, D3, dll"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Jurusan <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  placeholder="Contoh: Kedokteran, Keperawatan, dll"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tanggal Requirement <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.tanggalRequirement}
                  onChange={(e) => setFormData({ ...formData, tanggalRequirement: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
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
          title="Data Requirement" 
          subtitle="Kelola data requirement terapis"
          icon="fas fa-user-plus"
          iconColor="linear-gradient(135deg, #FF9500 0%, #FFB84D 100%)"
        />

        <div className="page-content">
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Daftar Requirement</h2>
              <button className="btn btn-primary btn-add" onClick={handleAdd}>
                <i className="fas fa-plus"></i> Tambah Requirement
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
                <button onClick={loadRequirements} style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}>
                  Coba Lagi
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Memuat data...</p>
              </div>
            ) : requirementList.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-plus"></i>
                <p>Belum ada data requirement</p>
                <button className="btn btn-primary" onClick={handleAdd}>
                  Tambah Requirement Pertama
                </button>
              </div>
            ) : (
              <div className="requirement-list">
                {requirementList.map((requirement) => (
                  <div key={requirement.id} className="requirement-card">
                    <div className="requirement-card-header">
                      <div className="requirement-avatar">
                        <i className="fas fa-user-plus"></i>
                      </div>
                      <div className="requirement-info">
                        <h3 className="requirement-name">{requirement.nama}</h3>
                        <p className="requirement-lulusan">{requirement.lulusan} - {requirement.jurusan}</p>
                      </div>
                    </div>
                    <div className="requirement-details">
                      <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span>Tanggal Requirement: {formatDateLocale(requirement.tanggalRequirement)}</span>
                      </div>
                    </div>
                    <div className="requirement-actions">
                      <button
                        className="btn-action btn-terima"
                        onClick={() => handleTerima(requirement)}
                      >
                        <i className="fas fa-check"></i>
                        Terima
                      </button>
                      <button
                        className="btn-action btn-tolak"
                        onClick={() => handleTidakTerima(requirement)}
                      >
                        <i className="fas fa-times"></i>
                        Tidak Terima
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cabang Selection Modal */}
        {showCabangModal && selectedRequirement && (
          <div className="modal-overlay" onClick={() => setShowCabangModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Pilih Cabang</h3>
                <button className="modal-close" onClick={() => setShowCabangModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>Pilih cabang untuk <strong>{selectedRequirement.nama}</strong>:</p>
                <div className="form-group">
                  <label className="form-label">Cabang (Opsional)</label>
                  <select
                    className="form-input"
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value)}
                  >
                    <option value="">-- Pilih Cabang (Opsional) --</option>
                    <option value="Batu Aji">Batu Aji</option>
                    <option value="Tiban">Tiban</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCabangModal(false)}>
                  Batal
                </button>
                <button className="btn btn-primary" onClick={handleConfirmAccept}>
                  Terima
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomNavigation />
      </div>
    </Page>
  );
};

