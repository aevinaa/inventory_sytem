import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ArrowLeft, Box, Edit, History, Plus, Minus, Trash2, Upload } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LowStockBadge from '../components/common/LowStockBadge';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState('');
  const [movementType, setMovementType] = useState('purchase');
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await apiClient.get(`/products/${id}`)).data,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['stockHistory', id],
    queryFn: async () => (await apiClient.get(`/stock/${id}/history`)).data,
  });

  const adjustMutation = useMutation({
    mutationFn: async (data) => (await apiClient.post('/stock/adjust', data)).data,
    onSuccess: () => {
      toast.success('Stock adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['stockHistory', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAdjustOpen(false);
      setAdjustQty('');
      setNote('');
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to adjust stock'),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => (await apiClient.delete(`/products/${id}`)).data,
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to delete'),
  });

  const imageMutation = useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('file', file);
      return (await apiClient.post(`/products/${id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })).data;
    },
    onSuccess: () => {
      toast.success('Image uploaded');
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setImageFile(null);
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Upload failed'),
  });

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjustQty) return;
    adjustMutation.mutate({
      product_id: id,  // UUID string — not parseInt
      quantity_delta: parseInt(adjustQty),
      movement_type: movementType,
      note: note || undefined,
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${product?.name}"? This cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      imageMutation.mutate(file);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af' }}>
      Product not found
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: 8, borderRadius: 8,
              border: '1.5px solid #e5e7eb', background: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a3c5e' }}>
            Product Details
          </h1>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate(`/products/${id}/edit`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: '1.5px solid #1a3c5e', background: 'white',
                color: '#1a3c5e', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              <Edit size={15} /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: '1.5px solid #dc2626', background: 'white',
                color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              <Trash2 size={15} />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Image */}
        <div style={{
          background: 'white', borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            aspectRatio: '1', background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box size={64} color="#d1d5db" />
            )}
          </div>
          {isAdmin && (
            <div style={{ padding: 12, borderTop: '1px solid #f3f4f6' }}>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', borderRadius: 8,
                border: '1.5px dashed #e5e7eb', background: '#f9fafb',
                cursor: 'pointer', fontSize: 13, color: '#6b7280',
                width: '100%', boxSizing: 'border-box',
              }}>
                <Upload size={15} />
                {imageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{
          background: 'white', borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: 24,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{
              background: '#dbeafe', color: '#1e40af',
              fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
            }}>
              {product.category?.name || 'No Category'}
            </span>
            <span style={{
              background: '#f3f4f6', color: '#374151',
              fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
            }}>
              {product.supplier?.name || 'No Supplier'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'SKU', value: product.sku },
              { label: 'Barcode', value: product.barcode || '—' },
              { label: 'Unit', value: product.unit },
              { label: 'Low Stock Threshold', value: product.low_stock_threshold },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</p>
              </div>
            ))}

            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Current Stock</p>
              <LowStockBadge quantity={product.quantity} threshold={product.low_stock_threshold} />
            </div>

            {product.description && (
              <div style={{ gridColumn: '1/-1' }}>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Description</p>
                <p style={{ fontSize: 14, color: '#374151' }}>{product.description}</p>
              </div>
            )}
          </div>

          {/* Adjust stock — admin only */}
          {isAdmin && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={() => setIsAdjustOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 8,
                  background: '#1a3c5e', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                <Plus size={16} /> Adjust Stock
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stock History */}
      <div style={{
        background: 'white', borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        padding: 24,
      }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: '#1a3c5e',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <History size={18} /> Stock History
        </h3>

        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><LoadingSpinner /></div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            <p>No stock movements yet</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['DATE', 'TYPE', 'CHANGE', 'BEFORE', 'AFTER', 'NOTE'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: h === 'CHANGE' ? 'center' : 'left',
                    fontSize: 11, fontWeight: 600, color: '#6b7280',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((record, i) => (
                <tr key={record.id} style={{
                  borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>
                    {new Date(record.created_at).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      padding: '2px 8px', borderRadius: 20,
                      background: record.movement_type === 'sale' ? '#fef2f2' :
                        record.movement_type === 'purchase' ? '#f0fdf4' : '#f3f4f6',
                      color: record.movement_type === 'sale' ? '#dc2626' :
                        record.movement_type === 'purchase' ? '#16a34a' : '#374151',
                    }}>
                      {record.movement_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: record.quantity_delta > 0 ? '#16a34a' : '#dc2626',
                    }}>
                      {record.quantity_delta > 0 ? '+' : ''}{record.quantity_delta}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                    {record.quantity_before}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                    {record.quantity_after}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                    {record.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}
          onClick={() => setIsAdjustOpen(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 12, padding: 28,
              width: '100%', maxWidth: 440,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a3c5e', marginBottom: 20 }}>
              Adjust Stock — {product.name}
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              Current stock: <strong>{product.quantity}</strong>
            </p>

            <form onSubmit={handleAdjustSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Movement Type
                </label>
                <select
                  value={movementType}
                  onChange={e => setMovementType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="purchase">Purchase — Add Stock</option>
                  <option value="return">Return — Add Stock</option>
                  <option value="adjustment">Manual Adjustment</option>
                  <option value="damage">Damage — Remove Stock</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Quantity
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>
                    (use negative to remove e.g. -5)
                  </span>
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  required
                  placeholder="e.g. 50 or -5"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Reason for adjustment..."
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    border: '1.5px solid #e5e7eb', background: 'white',
                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  style={{
                    padding: '10px 24px', borderRadius: 8,
                    background: adjustMutation.isPending ? '#9ca3af' : '#1a3c5e',
                    color: 'white', border: 'none',
                    cursor: adjustMutation.isPending ? 'not-allowed' : 'pointer',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {adjustMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;