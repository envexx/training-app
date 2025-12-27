import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { terapisAPI, tnaAPI } from '@/services/api';
import { formatDateForInput } from '@/utils/dateUtils';

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
    const loadTerapis = async () => {
      try {
        const response = await terapisAPI.getAll();
        if (response.success && response.data.terapis) {
          const terapis = response.data.terapis.map((t: any) => ({
            id: t.id,
            nama: t.nama,
            lulusan: t.lulusan,
          }));
          setTerapisList(terapis);
          
          // If terapisId from URL, set selected terapis
          if (terapisIdParam) {
            const found = terapis.find((t: Terapis) => t.id === terapisIdParam);
            if (found) {
              setSelectedTerapis(found);
              setTerapisId(terapisIdParam);
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading terapis:', err);
        alert('Gagal memuat data terapis');
      }
    };
    
    loadTerapis();
  }, [terapisIdParam]);

  // Load existing data if editing
  useEffect(() => {
    if (!terapisId) {
      return;
    }

    const loadTNAData = async () => {
      try {
        const response = await tnaAPI.getByTerapisId(terapisId);
        if (response.success && response.data) {
          // Backend returns: { success: true, data: { id, terapisId, ... } }
          const tna = response.data;
          
          // If editing specific TNA, check if ID matches
          if (tnaId && tna.id !== tnaId) {
            return; // Different TNA, don't load
          }
          
          // Load TNA data
          setFormData({
            noDokumen: tna.no_dokumen || tna.noDokumen || '',
            revisi: tna.revisi || '0',
            tglBerlaku: formatDateForInput(tna.tgl_berlaku || tna.tglBerlaku),
            unit: tna.unit || '',
            departement: tna.departement || '',
          });
          
          // Load training rows
          if (tna.trainingRows) {
            const rows = tna.trainingRows.map((row: any, index: number) => ({
              id: row.id || (index + 1).toString(),
              jenisTopik: row.jenis_topik || row.jenisTopik || '',
              alasan: row.alasan || '',
              peserta: row.peserta || '',
              rencanaPelaksanaan: row.rencana_pelaksanaan || row.rencanaPelaksanaan || '',
              budgetBiaya: row.budget_biaya || row.budgetBiaya || '',
            }));
            setTrainingRows(rows.length > 0 ? rows : [{
              id: '1',
              jenisTopik: '',
              alasan: '',
              peserta: '',
              rencanaPelaksanaan: '',
              budgetBiaya: '',
            }]);
          }
          
          // Load approval data
          if (tna.approval) {
            setApprovalData({
              diajukanOleh: tna.approval.diajukan_oleh || tna.approval.diajukanOleh || '',
              direviewOleh: tna.approval.direview_oleh || tna.approval.direviewOleh || '',
              disetujuiOleh1: tna.approval.disetujui_oleh_1 || tna.approval.disetujuiOleh1 || '',
              disetujuiOleh2: tna.approval.disetujui_oleh_2 || tna.approval.disetujuiOleh2 || '',
            });
          }
        } else if (!tnaId) {
          // No existing TNA, show confirmation if user wants to create new
          // (This is handled in handleSelectTerapis)
        }
      } catch (err: any) {
        // TNA not found is OK for new TNA
        if (tnaId) {
          console.error('Error loading TNA:', err);
        }
      }
    };

    loadTNAData();
  }, [terapisId, tnaId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSelectTerapis = async (terapis: Terapis) => {
    setSelectedTerapis(terapis);
    setTerapisId(terapis.id);
    setSearchQuery('');
    setShowSearchResults(false);
    
    // Check if terapis already has TNA
    if (!tnaId) {
      try {
        const response = await tnaAPI.getByTerapisId(terapis.id);
        if (response.success && response.data) {
          // Backend returns: { success: true, data: { id, terapisId, ... } }
          const tna = response.data;
          if (confirm('Terapis ini sudah memiliki data TNA. Apakah Anda ingin mengedit data yang ada?')) {
            setFormData({
              noDokumen: tna.no_dokumen || tna.noDokumen || '',
              revisi: tna.revisi || '0',
              tglBerlaku: formatDateForInput(tna.tgl_berlaku || tna.tglBerlaku),
              unit: tna.unit || '',
              departement: tna.departement || '',
            });
            
            if (tna.trainingRows) {
              const rows = tna.trainingRows.map((row: any, index: number) => ({
                id: row.id || (index + 1).toString(),
                jenisTopik: row.jenis_topik || row.jenisTopik || '',
                alasan: row.alasan || '',
                peserta: row.peserta || '',
                rencanaPelaksanaan: row.rencana_pelaksanaan || row.rencanaPelaksanaan || '',
                budgetBiaya: row.budget_biaya || row.budgetBiaya || '',
              }));
              setTrainingRows(rows.length > 0 ? rows : [{
                id: '1',
                jenisTopik: '',
                alasan: '',
                peserta: '',
                rencanaPelaksanaan: '',
                budgetBiaya: '',
              }]);
            }
            
            if (tna.approvalData) {
              const approval = tna.approvalData;
              setApprovalData({
                diajukanOleh: approval.diajukan_oleh || approval.diajukanOleh || '',
                direviewOleh: approval.direview_oleh || approval.direviewOleh || '',
                disetujuiOleh1: approval.disetujui_oleh_1 || approval.disetujuiOleh1 || '',
                disetujuiOleh2: approval.disetujui_oleh_2 || approval.disetujuiOleh2 || '',
              });
            }
          }
        }
      } catch (err) {
        // No existing TNA, continue with new form
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terapisId) {
      alert('Pilih terapis terlebih dahulu!');
      return;
    }

    // Validasi
    if (!formData.noDokumen || !formData.tglBerlaku || !formData.unit || !formData.departement) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    if (trainingRows.length === 0 || trainingRows.some(row => !row.jenisTopik.trim())) {
      alert('Minimal harus ada 1 baris training dengan Jenis/Topik Training yang diisi!');
      return;
    }
    
    try {
      // Prepare data for API (backend expects approvalData, not approval)
      const tnaData = {
        terapisId: terapisId,
        noDokumen: formData.noDokumen,
        revisi: formData.revisi || '0',
        tglBerlaku: formData.tglBerlaku,
        unit: formData.unit,
        departement: formData.departement,
        trainingRows: trainingRows.map(row => ({
          jenisTopik: row.jenisTopik,
          alasan: row.alasan,
          peserta: row.peserta,
          rencanaPelaksanaan: row.rencanaPelaksanaan,
          budgetBiaya: row.budgetBiaya,
        })),
        approvalData: {
          diajukanOleh: approvalData.diajukanOleh,
          direviewOleh: approvalData.direviewOleh,
          disetujuiOleh1: approvalData.disetujuiOleh1,
          disetujuiOleh2: approvalData.disetujuiOleh2,
        },
      };

      // If editing, include ID
      if (tnaId) {
        (tnaData as any).id = tnaId;
      }

      await tnaAPI.createOrUpdate(tnaData);
      alert('Form TNA berhasil disimpan!');
      navigate(`/detail-terapis/${terapisId}`);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan form TNA');
      console.error('Error saving TNA:', err);
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

