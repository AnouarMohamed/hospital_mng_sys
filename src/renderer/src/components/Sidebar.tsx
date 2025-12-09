import { LayoutDashboard, Users, Tv, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Reception', icon: Users, path: '/' },
    { name: 'Doctor View', icon: LayoutDashboard, path: '/doctor' },
    { name: 'Kiosk Display', icon: Tv, path: '/kiosk' },
  ];

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shadow-soft z-50">
      
      {/* Logo Area */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Medi<span className="text-brand-500">Flow</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-slate-100 pt-4">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-red-500 transition-colors text-sm font-medium">
          <LogOut size={18} />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}