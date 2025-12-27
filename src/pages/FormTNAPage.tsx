import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { dataStore, type TNAData } from '@/store/dataStore';

import './FormTNAPage.css';

interface TrainingRow {
  id: string;
  jenisTopik: string;
  alasan: string;
  peserta: string;
  rencanaPelaksanaan: string;
  budgetBiaya: string;
}

interface Terapis {
  id: string;
  nama: string;
  lulusan: string;
}

export const FormTNAPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const terapisIdParam = searchParams.get('terapisId');
  const tnaId = searchParams.get('id');

  const [terapisList, setTerapisList] = useState<Terapis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerapis, setSelectedTerapis] = useState<Terapis | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [terapisId, setTerapisId] = useState<string | null>(terapisIdParam);

  const [formData, setFormData] = useState({
    noDokumen: '',
    revisi: '0',
    tglBerlaku: '',
    unit: '',
    departement: '',
  });

  const [trainingRows, setTrainingRows] = useState<TrainingRow[]>([
    {
      id: '1',
      jenisTopik: '',
      alasan: '',
      peserta: '',
      rencanaPelaksanaan: '',
      budgetBiaya: '',
    },
  ]);

  const [approvalData, setApprovalData] = useState({
    diajukanOleh: '',
    direviewOleh: '',
    disetujuiOleh1: '',
    disetujuiOleh2: '',
  });

  // Load terapis list
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('terapis_list') || '[]');
    setTerapisList(stored);
    
    // If terapisId from URL, set selected terapis
    if (terapisIdParam) {
      const found = stored.find((t: Terapis) => t.id === terapisIdParam);
      if (found) {
        setSelectedTerapis(found);
        setTerapisId(terapisIdParam);
      }
    }
  }, [terapisIdParam]);

  // Load existing data if editing
  useEffect(() => {
    if (!terapisId) {
      return;
    }

    // Load existing TNA data if editing
    if (tnaId) {
      const existingTNA = dataStore.getAllTNA().find((t) => t.id === tnaId);
      if (existingTNA && existingTNA.terapisId === terapisId) {
        setFormData({
          noDokumen: existingTNA.noDokumen,
          revisi: existingTNA.revisi,
          tglBerlaku: existingTNA.tglBerlaku,
          unit: existingTNA.unit,
          departement: existingTNA.departement,
        });
        setTrainingRows(existingTNA.trainingRows);
        setApprovalData(existingTNA.approvalData);
      }
    } else {
      // Check if terapis already has TNA
      const existingTNA = dataStore.getTNAByTerapis(terapisId);
      if (existingTNA) {
        if (confirm('Terapis ini sudah memiliki data TNA. Apakah Anda ingin mengedit data yang ada?')) {
          setFormData({
            noDokumen: existingTNA.noDokumen,
            revisi: existingTNA.revisi,
            tglBerlaku: existingTNA.tglBerlaku,
            unit: existingTNA.unit,
            departement: existingTNA.departement,
          });
          setTrainingRows(existingTNA.trainingRows);
          setApprovalData(existingTNA.approvalData);
        }
      }
    }
  }, [terapisId, tnaId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSelectTerapis = (terapis: Terapis) => {
    setSelectedTerapis(terapis);
    setTerapisId(terapis.id);
    setSearchQuery('');
    setShowSearchResults(false);
    
    // Check if terapis already has TNA
    const existingTNA = dataStore.getTNAByTerapis(terapis.id);
    if (existingTNA && !tnaId) {
      if (confirm('Terapis ini sudah memiliki data TNA. Apakah Anda ingin mengedit data yang ada?')) {
        setFormData({
          noDokumen: existingTNA.noDokumen,
          revisi: existingTNA.revisi,
          tglBerlaku: existingTNA.tglBerlaku,
          unit: existingTNA.unit,
          departement: existingTNA.departement,
        });
        setTrainingRows(existingTNA.trainingRows);
        setApprovalData(existingTNA.approvalData);
      }
    }
  };

  const filteredTerapis = terapisList.filter((t) =>
    t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lulusan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRow = () => {
    const newRow: TrainingRow = {
      id: Date.now().toString(),
      jenisTopik: '',
      alasan: '',
      peserta: '',
      rencanaPelaksanaan: '',
      budgetBiaya: '',
    };
    setTrainingRows([...trainingRows, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    if (trainingRows.length > 1) {
      setTrainingRows(trainingRows.filter((row) => row.id !== id));
    } else {
      alert('Minimal harus ada 1 baris data');
    }
  };

  const handleRowChange = (id: string, field: keyof TrainingRow, value: string) => {
    setTrainingRows(
      trainingRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terapisId) return;

    // Validasi
    if (!formData.noDokumen || !formData.tglBerlaku || !formData.unit || !formData.departement) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }
    
    // Simpan ke dataStore
    const tnaData: TNAData = {
      id: tnaId || Date.now().toString(),
      terapisId: terapisId,
      ...formData,
      trainingRows,
      approvalData,
      createdAt: new Date().toISOString(),
    };

    dataStore.saveTNA(tnaData);
    alert('Form TNA berhasil disimpan!');
    navigate(`/detail-terapis?id=${terapisId}`);
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
          {/* Search Terapis */}
          <div className="menu-section">
            <h2 className="section-title">Pilih Terapis</h2>
            <div className="search-terapis-container">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari nama terapis atau lulusan..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                />
              </div>
              
              {showSearchResults && filteredTerapis.length > 0 && (
                <div className="search-results">
                  {filteredTerapis.map((terapis) => (
                    <div
                      key={terapis.id}
                      className="search-result-item"
                      onClick={() => handleSelectTerapis(terapis)}
                    >
                      <div className="result-avatar">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div className="result-info">
                        <div className="result-name">{terapis.nama}</div>
                        <div className="result-lulusan">{terapis.lulusan}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTerapis && (
                <div className="selected-terapis">
                  <div className="selected-terapis-info">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <div className="selected-name">{selectedTerapis.nama}</div>
                      <div className="selected-lulusan">{selectedTerapis.lulusan}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => {
                      setSelectedTerapis(null);
                      setTerapisId(null);
                      setFormData({
                        noDokumen: '',
                        revisi: '0',
                        tglBerlaku: '',
                        unit: '',
                        departement: '',
                      });
                      setTrainingRows([{
                        id: '1',
                        jenisTopik: '',
                        alasan: '',
                        peserta: '',
                        rencanaPelaksanaan: '',
                        budgetBiaya: '',
                      }]);
                      setApprovalData({
                        diajukanOleh: '',
                        direviewOleh: '',
                        disetujuiOleh1: '',
                        disetujuiOleh2: '',
                      });
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!selectedTerapis && (
            <div className="empty-state-form">
              <i className="fas fa-user-md"></i>
              <p>Silakan pilih terapis terlebih dahulu untuk membuat form TNA</p>
            </div>
          )}

          {selectedTerapis && (
            <form onSubmit={handleSubmit} className="tna-form">
            {/* Header Form */}
            <div className="form-section">
              <div className="form-header-row">
                <div className="form-field-inline">
                  <label className="form-label-inline">No. Dokumen:</label>
                  <input
                    type="text"
                    className="form-input-inline"
                    value={formData.noDokumen}
                    onChange={(e) => setFormData({ ...formData, noDokumen: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field-inline">
                  <label className="form-label-inline">Revisi Ke-:</label>
                  <input
                    type="text"
                    className="form-input-inline"
                    value={formData.revisi}
                    onChange={(e) => setFormData({ ...formData, revisi: e.target.value })}
                  />
                </div>
                <div className="form-field-inline">
                  <label className="form-label-inline">Tgl. Berlaku:</label>
                  <input
                    type="date"
                    className="form-input-inline"
                    value={formData.tglBerlaku}
                    onChange={(e) => setFormData({ ...formData, tglBerlaku: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Unit dan Departement */}
            <div className="form-section">
              <div className="form-header-row">
                <div className="form-field-inline">
                  <label className="form-label-inline">Unit:</label>
                  <input
                    type="text"
                    className="form-input-inline"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field-inline">
                  <label className="form-label-inline">Departement:</label>
                  <input
                    type="text"
                    className="form-input-inline"
                    value={formData.departement}
                    onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tabel Training */}
            <div className="form-section">
              <div className="table-container">
                <table className="tna-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Jenis / Topik Training</th>
                      <th>Alasan</th>
                      <th>Peserta</th>
                      <th>Rencana Pelaksanaan</th>
                      <th>Budget Biaya</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="td-number">{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={row.jenisTopik}
                            onChange={(e) => handleRowChange(row.id, 'jenisTopik', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={row.alasan}
                            onChange={(e) => handleRowChange(row.id, 'alasan', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={row.peserta}
                            onChange={(e) => handleRowChange(row.id, 'peserta', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={row.rencanaPelaksanaan}
                            onChange={(e) => handleRowChange(row.id, 'rencanaPelaksanaan', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={row.budgetBiaya}
                            onChange={(e) => handleRowChange(row.id, 'budgetBiaya', e.target.value)}
                          />
                        </td>
                        <td className="td-actions">
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteRow(row.id)}
                            title="Hapus baris"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-add-row"
                  onClick={handleAddRow}
                >
                  <i className="fas fa-plus"></i> Tambah Baris
                </button>
              </div>
            </div>

            {/* Approval Section */}
            <div className="form-section">
              <div className="approval-table-container">
                <table className="approval-table">
                  <thead>
                    <tr>
                      <th>Diajukan Oleh</th>
                      <th>Direview Oleh</th>
                      <th colSpan={2}>Disetujui Oleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="approval-input"
                          value={approvalData.diajukanOleh}
                          onChange={(e) => setApprovalData({ ...approvalData, diajukanOleh: e.target.value })}
                          placeholder="Nama / Tanda Tangan"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="approval-input"
                          value={approvalData.direviewOleh}
                          onChange={(e) => setApprovalData({ ...approvalData, direviewOleh: e.target.value })}
                          placeholder="Nama / Tanda Tangan"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="approval-input"
                          value={approvalData.disetujuiOleh1}
                          onChange={(e) => setApprovalData({ ...approvalData, disetujuiOleh1: e.target.value })}
                          placeholder="Nama / Tanda Tangan"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="approval-input"
                          value={approvalData.disetujuiOleh2}
                          onChange={(e) => setApprovalData({ ...approvalData, disetujuiOleh2: e.target.value })}
                          placeholder="Nama / Tanda Tangan"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary">
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Simpan Form
              </button>
            </div>
          </form>
          )}
        </div>

        <BottomNavigation />
      </div>
    </Page>
  );
};

