import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation.tsx';
import { rolesAPI } from '@/services/api';

import './AdminRolesPage.css';

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: any;
  createdAt: string;
  updatedAt: string;
}

export const AdminRolesPage: FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: {},
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rolesAPI.getAll();
      if (response.success && response.data.roles) {
        setRoles(response.data.roles);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      permissions: {},
    });
    setShowForm(true);
  };

  const handleEdit = (role: Role) => {
    setEditingId(role.id);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || {},
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      return;
    }

    try {
      await rolesAPI.delete(id);
      alert('Role berhasil dihapus');
      await loadRoles();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus role');
      console.error('Error deleting role:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Nama role wajib diisi!');
      return;
    }

    try {
      if (editingId) {
        await rolesAPI.update(editingId, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        alert('Role berhasil diupdate');
      } else {
        await rolesAPI.create({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions || {},
        });
        alert('Role berhasil dibuat');
      }

      await loadRoles();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        permissions: {},
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan role');
      console.error('Error saving role:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      permissions: {},
    });
  };

  if (showForm) {
    return (
      <Page>
        <div className="page-wrapper">
          <PageHeader
            title={editingId ? 'Edit Role' : 'Tambah Role'}
            subtitle="Kelola data role"
            icon="fas fa-user-shield"
            iconColor="linear-gradient(135deg, #7B68EE 0%, #9370DB 100%)"
          />
          <div className="page-content">
            <form onSubmit={handleSubmit} className="role-form">
              <div className="form-group">
                <label className="form-label">
                  Nama Role <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: supervisor, manager, dll"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi role dan akses yang diberikan"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Permissions (JSON)</label>
                <textarea
                  className="form-input form-textarea form-code"
                  value={JSON.stringify(formData.permissions || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, permissions: parsed });
                    } catch {
                      // Invalid JSON, keep as is
                    }
                  }}
                  rows={6}
                  placeholder='{"all": true} atau {"read": true, "write": false}'
                />
                <small className="form-hint">
                  Format JSON. Contoh: {"{"}"all": true{"}"} atau {"{"}"read": true, "write": false{"}"}
                </small>
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
          title="Kelola Role"
          subtitle="Buat & edit role custom"
          icon="fas fa-user-shield"
          iconColor="linear-gradient(135deg, #7B68EE 0%, #9370DB 100%)"
        />
        <div className="page-content">
          <div className="menu-section">
            <div className="section-header-actions">
              <h2 className="section-title">Daftar Role</h2>
              <button className="btn btn-primary btn-add" onClick={handleAdd}>
                <i className="fas fa-plus"></i> Tambah Role
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
                <button onClick={loadRoles} style={{ marginLeft: '12px', padding: '4px 8px', fontSize: '12px' }}>
                  Coba Lagi
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Memuat data...</p>
              </div>
            ) : roles.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-shield"></i>
                <p>Belum ada data role</p>
                <button className="btn btn-primary" onClick={handleAdd}>
                  Tambah Role Pertama
                </button>
              </div>
            ) : (
              <div className="roles-list">
                {roles.map((role) => (
                  <div key={role.id} className="role-card">
                    <div className="role-card-header">
                      <div className="role-icon">
                        <i className="fas fa-user-shield"></i>
                      </div>
                      <div className="role-info">
                        <h3 className="role-name">{role.name}</h3>
                        {role.description && (
                          <p className="role-description">{role.description}</p>
                        )}
                        <div className="role-permissions">
                          <small>
                            <strong>Permissions:</strong>{' '}
                            {role.permissions && typeof role.permissions === 'object'
                              ? JSON.stringify(role.permissions)
                              : 'No permissions set'}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="role-actions">
                      <button className="btn-action btn-edit" onClick={() => handleEdit(role)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(role.id)}>
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

