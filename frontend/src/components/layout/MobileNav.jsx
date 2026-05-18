import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ScanBarcode,
  BarChart3,
  MoreHorizontal
} from 'lucide-react';

const MobileNav = () => {
  const navClass = ({ isActive }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-[#c9922a]' : 'text-gray-300 hover:text-white'
    }`;

  return (
    <nav style={{
      display: 'block',
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: '#1a3c5e',
      zIndex: 50,
      boxShadow: '0 -4px 6px rgba(0,0,0,0.1)',
    }} className="md:hidden">
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>

        <NavLink to="/" end className={navClass}>
          <LayoutDashboard size={20} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>Home</span>
        </NavLink>

        <NavLink to="/products" className={navClass}>
          <Package size={20} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>Items</span>
        </NavLink>

        <NavLink to="/scan" className={navClass}>
          {({ isActive }) => (
            <>
              <div style={{
                padding: 8, borderRadius: '50%',
                background: isActive ? '#c9922a' : 'rgba(255,255,255,0.1)',
                color: 'white',
              }}>
                <ScanBarcode size={24} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 500 }}>Scan</span>
            </>
          )}
        </NavLink>

        <NavLink to="/reports" className={navClass}>
          <BarChart3 size={20} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>Reports</span>
        </NavLink>

        <NavLink to="/suppliers" className={navClass}>
          <MoreHorizontal size={20} />
          <span style={{ fontSize: 10, fontWeight: 500 }}>More</span>
        </NavLink>

      </div>
    </nav>
  );
};

export default MobileNav