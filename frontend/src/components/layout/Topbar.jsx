import { LogOut, User, Store } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useShopStore from '../../store/shopStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { queryClient } from '../../main';

const Topbar = () => {
  const { user, logout } = useAuthStore();
  const { currentShop, setShop } = useShopStore();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);

  useEffect(() => {
    apiClient.get('/shops').then(res => {
      setShops(res.data);
      // Auto-select first shop if none selected
      if (!currentShop && res.data.length > 0) {
        setShop(res.data[0]);
      }
    }).catch(() => { });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShopChange = async (e) => {
    const shop = shops.find(s => s.id === e.target.value);
    if (!shop) return;
    setShop(shop);
    await queryClient.invalidateQueries();
  };

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Left — welcome */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a3c5e' }}>
          Welcome, {user?.name || 'User'}
        </h2>
      </div>

      {/* Right — shop switcher + user + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Shop Switcher */}
        {shops.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={16} color="#1a3c5e" />
            <select
              value={currentShop?.id || ''}
              onChange={handleShopChange}
              style={{
                padding: '6px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#1a3c5e',
                background: '#f0f7ff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* User badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f3f4f6', padding: '6px 12px',
          borderRadius: 20, fontSize: 13,
        }}>
          <User size={15} color="#6b7280" />
          <span style={{ fontWeight: 500, color: '#374151' }}>{user?.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: '#dbeafe', color: '#1a3c5e',
            padding: '2px 8px', borderRadius: 10,
            textTransform: 'uppercase',
          }}>
            {user?.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#dc2626', background: 'none',
            border: 'none', cursor: 'pointer',
            padding: '6px 10px', borderRadius: 8,
            fontSize: 14, fontWeight: 500,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;