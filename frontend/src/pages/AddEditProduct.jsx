import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ArrowLeft, Save, Tag, Upload } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import useShopStore from '../store/shopStore';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentShop } = useShopStore();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    unit: 'piece',
    quantity: 0,
    low_stock_threshold: 5,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', currentShop?.id],
    queryFn: async () => {
      const res = await apiClient.get('/categories', {
        params: { shop_id: currentShop?.id }
      });
      return res.data;
    },
    enabled: !!currentShop?.id,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', currentShop?.id],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers', {
        params: { shop_id: currentShop?.id }
      });
      return res.data;
    },
    enabled: !!currentShop?.id,
  });

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        unit: product.unit || 'piece',
        quantity: product.quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
      });
      if (product.image_url) setImagePreview(product.image_url);
    }
  }, [isEditMode, product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let savedProduct;
      if (isEditMode) {
        const res = await apiClient.put(`/products/${id}`, data);
        savedProduct = res.data;
      } else {
        const res = await apiClient.post(`/products?shop_id=${currentShop?.id}`, data);
        savedProduct = res.data;
      }

      // Upload image if selected
      if (imageFile && savedProduct.id) {
        const form = new FormData();
        form.append('file', imageFile);
        await apiClient.post(`/products/${savedProduct.id}/image`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      return savedProduct;
    },
    onSuccess: (data) => {
      toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (!isEditMode && data.barcode) {
        setTimeout(() => {
          toast(
            (t) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>🏷️ Barcode Assigned!</span>
                <span style={{
                  fontFamily: 'monospace', fontSize: 28,
                  color: '#1a3c5e', fontWeight: 700, letterSpacing: 4,
                }}>
                  {data.barcode}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Enter this number into your Decode printer app to print the barcode sticker.
                </span>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    marginTop: 4, padding: '6px 12px',
                    background: '#1a3c5e', color: 'white',
                    border: 'none', borderRadius: 6,
                    cursor: 'pointer', fontSize: 13,
                  }}
                >
                  Got it
                </button>
              </div>
            ),
            { duration: 15000 }
          );
        }, 500);
      }

      navigate('/products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} product`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!currentShop?.id && !isEditMode) {
      toast.error('Please select a shop first');
      return;
    }
    saveMutation.mutate({
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null,
    });
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', background: 'white',
  };

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600, color: '#374151', marginBottom: 6,
  };

  if (isEditMode && isLoadingProduct) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
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
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a3c5e' }}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {currentShop?.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white', borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 28,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Product Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Product Name *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Gold Necklace 22K"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Image Upload */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Product Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                  />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: 8,
                    border: '2px dashed #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#f9fafb',
                  }}>
                    <Upload size={24} color="#9ca3af" />
                  </div>
                )}
                <div>
                  <label style={{
                    display: 'inline-block', padding: '8px 16px',
                    background: '#f3f4f6', borderRadius: 8,
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    border: '1px solid #e5e7eb',
                  }}>
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                    JPG, PNG or WEBP — max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label style={labelStyle}>Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label style={labelStyle}>Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="piece">Piece</option>
                <option value="gram">Gram</option>
                <option value="kg">Kilogram</option>
                <option value="meter">Meter</option>
                <option value="set">Set</option>
                <option value="pair">Pair</option>
                <option value="box">Box</option>
              </select>
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label style={labelStyle}>Low Stock Alert Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Initial Quantity */}
            {!isEditMode && (
              <div>
                <label style={labelStyle}>Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional product description..."
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Barcode info */}
          {!isEditMode && (
            <div style={{
              marginTop: 20, padding: '14px 16px',
              background: '#f0f7ff', borderRadius: 8,
              border: '1px solid #bfdbfe',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <Tag size={18} color="#1a3c5e" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a3c5e' }}>
                  Barcode will be auto-generated
                </p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  After saving, you'll see the barcode number. Enter it into your Decode printer app to print the sticker.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            gap: 12, marginTop: 28, paddingTop: 20,
            borderTop: '1px solid #f3f4f6',
          }}>
            <button
              type="button"
              onClick={() => navigate('/products')}
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
              disabled={saveMutation.isPending}
              style={{
                padding: '10px 24px', borderRadius: 8,
                background: saveMutation.isPending ? '#9ca3af' : '#1a3c5e',
                color: 'white', border: 'none',
                cursor: saveMutation.isPending ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <Save size={16} />
              {saveMutation.isPending ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;