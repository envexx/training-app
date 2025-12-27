import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { terapisAPI } from '@/services/api';
import { formatDateForInput, formatDateLocale } from '@/utils/dateUtils';

import './DataTerapisPage.css';

interface Terapis {
  id: string;
  nama: string;
  lulusan: string;
  tanggalRequirement: string;
  cabang?: string;
  mulaiKontrak?: string;
  endKontrak?: string;
  alamat?: string;
  noTelp?: string;
  email?: string;
}

export const DataTerapisPage: FC = () => {
  const navigate = useNavigate();
  const [terapisList, setTerapisList] = useState<Terapis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCabang, setFilterCabang] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Terapis>>({
    nama: '',
    lulusan: '',
    tanggalRequirement: '',
    cabang: '',
    mulaiKontrak: '',
    endKontrak: '',
    alamat: '',
    noTelp: '',
    email: '',
  });

  // Load terapis from API
  const loadTerapis = async (cabangFilter?: string) => {
    try {
      setLoading(true);
      setError('');
      // Only send cabang parameter if it has a value
      const params: any = {};
      const filterValue = cabangFilter !== undefined ? cabangFilter : filterCabang;
      console.log('loadTerapis called with filterCabang:', filterValue, 'Type:', typeof filterValue);
      if (filterValue && filterValue.trim() !== '') {
        params.cabang = filterValue.trim();
        console.log('Adding cabang to params:', params.cabang);
      }
      console.log('Loading terapis with filter:', params);
      const response = await terapisAPI.getAll(params);
      if (response.success && response.data.terapis) {
        // Ensure dates are properly formatted
        const terapisList = response.data.terapis.map((t: any) => ({
          ...t,
          tanggalRequirement: t.tanggalRequirement || t.tanggal_requirement,
          cabang: t.cabang,
          mulaiKontrak: t.mulaiKontrak || t.mulai_kontrak,
          endKontrak: t.endKontrak || t.end_kontrak,
        }));
        console.log('Loaded terapis:', terapisList.length, 'items');
        console.log('Cabang values:', terapisList.map((t: Terapis) => ({ nama: t.nama, cabang: t.cabang })));
        setTerapisList(terapisList);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data terapis');
      console.error('Error loading terapis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, filterCabang:', filterCabang);
    loadTerapis(filterCabang);
  }, [filterCabang]);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      lulusan: '',
      tanggalRequirement: '',
      cabang: '',
      mulaiKontrak: '',
      endKontrak: '',
      alamat: '',
      noTelp: '',
      email: '',
    });
    setShowForm(true);
  };

  const handleEdit = (terapis: Terapis) => {
    setEditingId(terapis.id);
    setFormData({
      nama: terapis.nama,
      lulusan: terapis.lulusan,
      tanggalRequirement: formatDateForInput(terapis.tanggalRequirement),
      cabang: terapis.cabang || '',
      mulaiKontrak: formatDateForInput(terapis.mulaiKontrak),
      endKontrak: formatDateForInput(terapis.endKontrak),
      alamat: terapis.alamat || '',
      noTelp: terapis.noTelp || '',
      email: terapis.email || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data terapis ini?')) {
      return;
    }

    try {
      await terapisAPI.delete(id);
      // Reload list after delete
      await loadTerapis(filterCabang);
      alert('Terapis berhasil dihapus');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus terapis');
      console.error('Error deleting terapis:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi required fields
    if (!formData.nama || !formData.lulusan || !formData.tanggalRequirement) {
      alert('Nama, Lulusan, dan Tanggal Requirement wajib diisi!');
      return;
    }

    try {
      const payload = {
        nama: formData.nama,
        lulusan: formData.lulusan,
        tanggalRequirement: formData.tanggalRequirement,
        cabang: formData.cabang || undefined,
        mulaiKontrak: formData.mulaiKontrak || undefined,
        endKontrak: formData.endKontrak || undefined,
        alamat: formData.alamat || undefined,
        noTelp: formData.noTelp || undefined,
        email: formData.email || undefined,
      };

      if (editingId) {
        await terapisAPI.update(editingId, payload);
        alert('Terapis berhasil diupdate');
      } else {
        await terapisAPI.create(payload);
        alert('Terapis berhasil ditambahkan');
      }

      // Reload list
      await loadTerapis(filterCabang);
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        nama: '',
        lulusan: '',
        tanggalRequirement: '',
        mulaiKontrak: '',
        endKontrak: '',
        alamat: '',
        noTelp: '',
        email: '',
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan terapis');
      console.error('Error saving terapis:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nama: '',
      lulusan: '',
      tanggalRequirement: '',
      cabang: '',
      mulaiKontrak: '',
      endKontrak: '',
      alamat: '',
      noTelp: '',
      email: '',
    });
  };

  if (showForm) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader 
            title={editingId ? "Edit Data Terapis" : "Tambah Data Terapis"} 
            subtitle={editingId ? "Ubah data terapis" : "Tambah terapis baru"}
            icon="fas fa-user-md"
            iconColor="linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)"
          />

          <div className="page-content">
            <form onSubmit={handleSubmit} className="terapis-form">
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

              <div className="form-group">
                <label className="form-label">Cabang</label>
                <select
                  className="form-input"
                  value={formData.cabang}
                  onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                >
                  <option value="">-- Pilih Cabang (Opsional) --</option>
                  <option value="Batu Aji">Batu Aji</option>
                  <option value="Tiban">Tiban</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mulai Kontrak</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.mulaiKontrak}
                  onChange={(e) => setFormData({ ...formData, mulaiKontrak: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Kontrak</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endKontrak}
                  onChange={(e) => setFormData({ ...formData, endKontrak: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.noTelp}
                  onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Simpan'}
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
          title="Data Terapis" 
          subtitle="Kelola data terapis"
          icon="fas fa-user-md"
          iconColor="linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)"
        />

        <div className="page-content">
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Daftar Terapis</h2>
              <div className="header-actions-group">
                <select
                  className="filter-select"
                  value={filterCabang}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('Filter changed to:', newValue);
                    setFilterCabang(newValue);
                  }}
                >
                  <option value="">Semua Cabang</option>
                  <option value="Batu Aji">Batu Aji</option>
                  <option value="Tiban">Tiban</option>
                </select>
                <button className="btn btn-primary btn-add" onClick={handleAdd}>
                  <i className="fas fa-plus"></i> Tambah Terapis
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
                <button onClick={() => loadTerapis(filterCabang)} style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}>
                  Coba Lagi
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Memuat data...</p>
              </div>
            ) : terapisList.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-md"></i>
                <p>Belum ada data terapis</p>
                <button className="btn btn-primary" onClick={handleAdd}>
                  Tambah Terapis Pertama
                </button>
              </div>
            ) : (
              <div className="terapis-list">
                {terapisList.map((terapis) => (
                  <div key={terapis.id} className="terapis-card">
                    <div className="terapis-card-header">
                      <div className="terapis-avatar">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div className="terapis-info">
                        <h3 className="terapis-name">{terapis.nama}</h3>
                        <p className="terapis-lulusan">{terapis.lulusan}</p>
                      </div>
                    </div>
                    <div className="terapis-details">
                      <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span>Requirement: {formatDateLocale(terapis.tanggalRequirement)}</span>
                      </div>
                      {terapis.cabang && (
                        <div className="detail-item">
                          <i className="fas fa-building"></i>
                          <span>Cabang: {terapis.cabang}</span>
                        </div>
                      )}
                      {terapis.mulaiKontrak && (
                        <div className="detail-item">
                          <i className="fas fa-calendar-check"></i>
                          <span>Mulai: {formatDateLocale(terapis.mulaiKontrak)}</span>
                        </div>
                      )}
                      {terapis.endKontrak && (
                        <div className="detail-item">
                          <i className="fas fa-calendar-times"></i>
                          <span>End: {formatDateLocale(terapis.endKontrak)}</span>
                        </div>
                      )}
                      {terapis.noTelp && (
                        <div className="detail-item">
                          <i className="fas fa-phone"></i>
                          <span>{terapis.noTelp}</span>
                        </div>
                      )}
                      {terapis.email && (
                        <div className="detail-item">
                          <i className="fas fa-envelope"></i>
                          <span>{terapis.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="terapis-actions">
                      <button className="btn-action btn-edit" onClick={() => handleEdit(terapis)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(terapis.id)}>
                        <i className="fas fa-trash"></i> Hapus
                      </button>
                    </div>

                    {/* Link ke Detail */}
                    <div className="terapis-forms-section">
                      <button
                        className="btn btn-primary btn-full"
                        onClick={() => navigate(`/detail-terapis/${terapis.id}`)}
                      >
                        <i className="fas fa-eye"></i> Lihat Detail & Form
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

