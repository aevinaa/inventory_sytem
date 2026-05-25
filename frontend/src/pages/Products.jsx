import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Box } from 'lucide-react';
import { getProducts } from '../api/products';
import { useDebounce } from '../hooks/useDebounce';
import useAuthStore from '../store/authStore';
import useShopStore from '../store/shopStore';
import apiClient from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LowStockBadge from '../components/common/LowStockBadge';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentShop } = useShopStore();
  const isAdmin = user?.role === 'admin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['products', currentShop?.id, page, debouncedSearch, categoryId, lowStockOnly],
    queryFn: () => getProducts({
      page,
      limit: 50,
      search: debouncedSearch || undefined,
      category_id: categoryId || undefined,
      low_stock_only: lowStockOnly || undefined,
      shop_id: currentShop?.id,
    }),
    enabled: !!currentShop?.id,
  });

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
  
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a3c5e' }}>Products</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            {currentShop?.name} — Manage your inventory items
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/products/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#1a3c5e', color: 'white',
              padding: '10px 20px', borderRadius: 8,
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
            }}
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* No shop selected */}
      {!currentShop && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🏪</p>
          <p style={{ fontWeight: 500 }}>Please select a shop from the top bar</p>
        </div>
      )}

      {currentShop && (
        <>
          {/* Filters */}
          <div style={{
            background: 'white', borderRadius: 12, padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16,
            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                placeholder="Search by name, SKU, or barcode..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  border: '1.5px solid #e5e7eb', borderRadius: 8,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              style={{
                padding: '9px 12px', border: '1.5px solid #e5e7eb',
                borderRadius: 8, fontSize: 14, outline: 'none',
                background: 'white', minWidth: 160,
              }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setPage(1);
              }}

              style={{
                padding: '9px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                background: 'white',
                minWidth: 160,
              }}
            >
              <option value="">All Suppliers</option>

              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
              />
              Low Stock Only
            </label>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['PRODUCT', 'SKU / BARCODE', 'CATEGORY', 'STOCK'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: '#6b7280',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 60, textAlign: 'center' }}>
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : !data?.items?.length ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                      <p style={{ fontWeight: 500 }}>No products found</p>
                      {isAdmin && (
                        <p style={{ fontSize: 13, marginTop: 4 }}>
                          Click "Add Product" to add your first product
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  data.items.map((product, i) => (
                    <tr
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      style={{
                        borderBottom: i < data.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8,
                              background: '#f3f4f6', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Box size={18} color="#9ca3af" />
                            </div>
                          )}
                          <span style={{ fontWeight: 500, color: '#111827', fontSize: 14 }}>
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{product.sku}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{product.barcode}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          background: '#dbeafe', color: '#1e40af',
                          fontSize: 12, fontWeight: 500,
                          padding: '3px 10px', borderRadius: 20,
                        }}>
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <LowStockBadge quantity={product.quantity} threshold={product.low_stock_threshold} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.pages > 1 && (
              <div style={{
                padding: '12px 20px', borderTop: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  {data.total} products total
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '6px 14px', borderRadius: 6,
                      border: '1px solid #e5e7eb', background: 'white',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1, fontSize: 13,
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: 13, color: '#374151' }}>
                    {page} / {data.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
                    style={{
                      padding: '6px 14px', borderRadius: 6,
                      border: '1px solid #e5e7eb', background: 'white',
                      cursor: page === data.pages ? 'not-allowed' : 'pointer',
                      opacity: page === data.pages ? 0.5 : 1, fontSize: 13,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
