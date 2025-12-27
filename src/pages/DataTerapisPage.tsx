import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { dataStore } from '@/store/dataStore';

import './DataTerapisPage.css';

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

export const DataTerapisPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewTerapisId = searchParams.get('view');

  const loadTerapisList = (): Terapis[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    // Default data
    return [
      {
        id: '1',
        nama: 'Dr. Ahmad Fauzi',
        lulusan: 'S1 Kedokteran',
        tanggalRequirement: '2024-01-15',
        mulaiKontrak: '2024-02-01',
        endKontrak: '2025-01-31',
        alamat: 'Jl. Sudirman No. 123',
        noTelp: '081234567890',
        email: 'ahmad@example.com',
      },
    ];
  };

  const [terapisList, setTerapisList] = useState<Terapis[]>(loadTerapisList());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Terapis>>({
    nama: '',
    lulusan: '',
    tanggalRequirement: '',
    mulaiKontrak: '',
    endKontrak: '',
    alamat: '',
    noTelp: '',
    email: '',
  });

  const handleAdd = () => {
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
    setShowForm(true);
  };

  const handleEdit = (terapis: Terapis) => {
    setEditingId(terapis.id);
    setFormData({
      nama: terapis.nama,
      lulusan: terapis.lulusan,
      tanggalRequirement: terapis.tanggalRequirement,
      mulaiKontrak: terapis.mulaiKontrak || '',
      endKontrak: terapis.endKontrak || '',
      alamat: terapis.alamat || '',
      noTelp: terapis.noTelp || '',
      email: terapis.email || '',
    });
    setShowForm(true);
  };

  // Save to localStorage whenever terapisList changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terapisList));
  }, [terapisList]);

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data terapis ini?')) {
      setTerapisList(terapisList.filter((t) => t.id !== id));
      // Also delete related TNA and Evaluasi
      const tnaData = dataStore.getTNAByTerapis(id);
      if (tnaData) {
        dataStore.deleteTNA(tnaData.id);
      }
      const evaluasiData = dataStore.getEvaluasiByTerapis(id);
      if (evaluasiData) {
        dataStore.deleteEvaluasi(evaluasiData.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi required fields
    if (!formData.nama || !formData.lulusan || !formData.tanggalRequirement) {
      alert('Nama, Lulusan, dan Tanggal Requirement wajib diisi!');
      return;
    }

    if (editingId) {
      // Update existing
      setTerapisList(
        terapisList.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...formData,
                mulaiKontrak: formData.mulaiKontrak || undefined,
                endKontrak: formData.endKontrak || undefined,
                alamat: formData.alamat || undefined,
                noTelp: formData.noTelp || undefined,
                email: formData.email || undefined,
              }
            : t
        )
      );
    } else {
      // Add new
      const newTerapis: Terapis = {
        id: Date.now().toString(),
        nama: formData.nama!,
        lulusan: formData.lulusan!,
        tanggalRequirement: formData.tanggalRequirement!,
        mulaiKontrak: formData.mulaiKontrak || undefined,
        endKontrak: formData.endKontrak || undefined,
        alamat: formData.alamat || undefined,
        noTelp: formData.noTelp || undefined,
        email: formData.email || undefined,
      };
      const updatedList = [...terapisList, newTerapis];
      setTerapisList(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    }

    setShowForm(false);
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
  };

  const handleCancel = () => {
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
              <button className="btn btn-primary btn-add" onClick={handleAdd}>
                <i className="fas fa-plus"></i> Tambah Terapis
              </button>
            </div>

            {terapisList.length === 0 ? (
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
                        <span>Requirement: {new Date(terapis.tanggalRequirement).toLocaleDateString('id-ID')}</span>
                      </div>
                      {terapis.mulaiKontrak && (
                        <div className="detail-item">
                          <i className="fas fa-calendar-check"></i>
                          <span>Mulai: {new Date(terapis.mulaiKontrak).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {terapis.endKontrak && (
                        <div className="detail-item">
                          <i className="fas fa-calendar-times"></i>
                          <span>End: {new Date(terapis.endKontrak).toLocaleDateString('id-ID')}</span>
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
                        onClick={() => navigate(`/detail-terapis?id=${terapis.id}`)}
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

