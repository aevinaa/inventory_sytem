import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import useShopStore from '../store/shopStore';

const Suppliers = () => {
  const queryClient = useQueryClient();
  const { currentShop } = useShopStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', currentShop?.id],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers', {
        params: { shop_id: currentShop?.id }
      });
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => (await apiClient.post('/suppliers', {
      ...data,
      shop_id: currentShop?.id,
    })).data,
    onSuccess: () => {
      toast.success('Supplier created successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await apiClient.put(`/suppliers/${id}`, data)).data,
    onSuccess: () => {
      toast.success('Supplier updated successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to update supplier'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await apiClient.delete(`/suppliers/${id}`)).data,
    onSuccess: () => {
      toast.success('Supplier deactivated');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
  });

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Deactivate "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a3c5e' }}>Suppliers</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            {currentShop?.name} — Manage your product suppliers
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1a3c5e', color: 'white',
            padding: '10px 20px', borderRadius: 8,
            border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
          }}
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['COMPANY', 'CONTACT', 'EMAIL / PHONE', 'ACTIONS'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px',
                    textAlign: h === 'ACTIONS' ? 'right' : 'left',
                    fontSize: 11, fontWeight: 600, color: '#6b7280',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏭</div>
                    <p style={{ fontWeight: 500 }}>No suppliers found</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add Supplier" to add your first supplier</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, i) => (
                  <tr
                    key={supplier.id}
                    style={{
                      borderBottom: i < suppliers.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>
                        {supplier.name}
                      </div>
                      {supplier.address && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          {supplier.address}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#6b7280', fontSize: 14 }}>
                      {supplier.contact_person || '-'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 14, color: '#374151' }}>{supplier.email || '-'}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{supplier.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          onClick={() => openModal(supplier)}
                          style={{
                            background: 'none', border: 'none',
                            cursor: 'pointer', color: '#1a3c5e',
                            padding: 6, borderRadius: 6,
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#c9922a'}
                          onMouseLeave={e => e.currentTarget.style.color = '#1a3c5e'}
                          title="Edit supplier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id, supplier.name)}
                          style={{
                            background: 'none', border: 'none',
                            cursor: 'pointer', color: '#dc2626',
                            padding: 6, borderRadius: 6,
                          }}
                          title="Deactivate supplier"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Company Name *
              </label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Rajesh Traders"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Contact Person
              </label>
              <input
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Phone
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@email.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Address
              </label>
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: '1.5px solid #e5e7eb', background: 'white',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{
                  padding: '10px 24px', borderRadius: 8,
                  background: '#1a3c5e', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  opacity: createMutation.isPending || updateMutation.isPending ? 0.7 : 1,
                }}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingSupplier ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;