import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ScanBarcode,
  Truck,
  BarChart3,
  Users,
  Tag,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Scan', path: '/scan', icon: ScanBarcode },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'Users', path: '/users', icon: Users }] : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#1a3c5e] text-white shadow-xl">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wider text-[#c9922a]">
          Jewel Inventory
        </h1>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-[#c9922a] text-white font-medium shadow-md'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-xs text-center text-gray-400">
        &copy; {new Date().getFullYear()} Jewel Inventory
      </div>
    </aside>
  );
};

export default Sidebar;