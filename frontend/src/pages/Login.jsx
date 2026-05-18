import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { login as loginApi } from '../api/auth';
import { getMe } from '../api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      // Step 1 — get tokens
      const data = await loginApi(email, password);
      // Step 2 — get real user info
      localStorage.setItem('access_token', data.access_token);
      const user = await getMe();
      // Step 3 — store everything
      loginStore(user, data.access_token, data.refresh_token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f2440 0%, #1a3c5e 50%, #0f2440 100%)',
    }}>
      {/* Left branding panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        color: 'white',
      }} className="hidden-mobile">
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, #c9922a, #e8b84b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 32,
          boxShadow: '0 20px 40px rgba(201,146,42,0.3)',
        }}>
          💎
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16, letterSpacing: '-1px' }}>
          Jewel Inventory
        </h1>
        <p style={{ fontSize: 18, opacity: 0.7, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
          Professional inventory management for jewellery, handicrafts & clothing
        </p>
        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Real-time stock tracking', 'Barcode scan to sell', 'Daily sales reports', 'Low stock alerts'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9922a' }} />
              <span style={{ fontSize: 15 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px',
        background: 'white',
      }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a3c5e', marginBottom: 8 }}>
              Sign in
            </h2>
            <p style={{ color: '#6b7280', fontSize: 15 }}>
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourbusiness.com"
                required
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '2px solid #e5e7eb', borderRadius: 10,
                  fontSize: 15, outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '2px solid #e5e7eb', borderRadius: 10,
                  fontSize: 15, outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '14px',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #1a3c5e, #2d6a9f)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 16, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(26,60,94,0.3)',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            Jewel Inventory Management System
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;