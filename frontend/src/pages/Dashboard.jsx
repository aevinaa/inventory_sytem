import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import useShopStore from '../store/shopStore';

const StatCard = ({ label, value, color, icon, sublabel }) => (
  <div style={{
    background: 'white', borderRadius: 12, padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${color}`,
    display: 'flex', flexDirection: 'column', gap: 8,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <span style={{ fontSize: 24 }}>{icon}</span>
    </div>
    <p style={{ fontSize: 36, fontWeight: 700, color: color, lineHeight: 1 }}>
      {value}
    </p>
    {sublabel && <p style={{ fontSize: 12, color: '#9ca3af' }}>{sublabel}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const { currentShop } = useShopStore();
  const [dashboard, setDashboard] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentShop?.id) return;
    setLoading(true);
    Promise.all([
      client.get(`/reports/dashboard?shop_id=${currentShop.id}`),
      client.get(`/reports/sales-trend?days=30&shop_id=${currentShop.id}`),
    ])
      .then(([dashRes, trendRes]) => {
        setDashboard(dashRes.data);
        setTrend(trendRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [currentShop?.id]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a3c5e' }}>
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
        {currentShop && (
          <p style={{ color: '#c9922a', fontWeight: 600, marginTop: 4, fontSize: 14 }}>
            🏪 {currentShop.name}
          </p>
        )}
      </div>

      {!currentShop ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🏪</p>
          <p style={{ fontWeight: 500 }}>Select a shop from the top bar to view dashboard</p>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 40, height: 40, border: '4px solid #e5e7eb',
            borderTopColor: '#1a3c5e', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16, marginBottom: 32,
          }}>
            <StatCard
              label="Total Products"
              value={dashboard?.total_products ?? 0}
              color="#1a3c5e"
              icon="📦"
              sublabel="Active products in inventory"
            />
            <StatCard
              label="Low Stock Alerts"
              value={dashboard?.low_stock_count ?? 0}
              color={dashboard?.low_stock_count > 0 ? '#dc2626' : '#16a34a'}
              icon="⚠️"
              sublabel={dashboard?.low_stock_count > 0 ? 'Items need restocking' : 'All stock levels OK'}
            />
            <StatCard
              label="Today's Sales"
              value={dashboard?.today_transactions ?? 0}
              color="#c9922a"
              icon="🛍️"
              sublabel="Transactions today"
            />
            <StatCard
              label="Units Sold Today"
              value={dashboard?.today_units_sold ?? 0}
              color="#7c3aed"
              icon="📊"
              sublabel="Items sold today"
            />
          </div>

          {/* Charts + Top Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}
            className="dashboard-grid">

            {/* Sales Trend Chart */}
            <div style={{
              background: 'white', borderRadius: 12, padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a3c5e', marginBottom: 20 }}>
                Sales Trend — Last 30 Days
              </h2>
              {trend.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>📈</p>
                  <p>No sales data yet</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Start scanning products to see trends</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={d => d.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                      formatter={(value) => [value, 'Units Sold']}
                    />
                    <Line
                      type="monotone"
                      dataKey="units_sold"
                      stroke="#c9922a"
                      strokeWidth={2.5}
                      dot={{ fill: '#c9922a', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Selling Products */}
            <div style={{
              background: 'white', borderRadius: 12, padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a3c5e', marginBottom: 20 }}>
                Top Selling Products
              </h2>
              {!dashboard?.top_selling_products?.length ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🏆</p>
                  <p>No sales recorded yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dashboard.top_selling_products.map((p, i) => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center',
                      gap: 12, padding: '10px 0',
                      borderBottom: i < dashboard.top_selling_products.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 0 ? '#c9922a' : i === 1 ? '#9ca3af' : '#d97706',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: 500, color: '#111827', fontSize: 14,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {p.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>{p.sku}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 600, color: '#c9922a', fontSize: 14 }}>
                          {p.total_sold} sold
                        </p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>
                          {p.current_quantity} left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert Banner */}
          {dashboard?.low_stock_count > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                  <p style={{ fontWeight: 600, color: '#dc2626' }}>
                    {dashboard.low_stock_count} item{dashboard.low_stock_count > 1 ? 's' : ''} running low on stock
                  </p>
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>
                    Check the Reports page for details
                  </p>
                </div>
              </div>
              <Link to="/reports" style={{
                background: '#dc2626', color: 'white',
                padding: '8px 16px', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
              }}>
                View Low Stock →
              </Link>
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;