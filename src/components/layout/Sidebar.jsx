import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, BarChart2, Settings, Shield, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/supabase';
import { useDemo } from '../../context/DemoContext';

export default function Sidebar({ isOpen, close }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDemo, exitDemo, demoBusiness } = useDemo();

  const handleSignOut = async () => {
    if (isDemo) {
      exitDemo();
    } else {
      await signOut();
    }
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/analytics', icon: BarChart2, label: t('nav.analytics') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-navy text-white flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">ComplianceAI</h1>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold">Business Shield</p>
            </div>
          </div>
          <button onClick={close} className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-glow' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">
                {isDemo ? demoBusiness?.owner_name?.[0] : user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold text-white truncate">
                  {isDemo ? demoBusiness?.owner_name : 'My Account'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {isDemo ? demoBusiness?.email : user?.email || 'Logged in'}
                </div>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium text-gray-300 transition-colors"
            >
              <LogOut size={16} />
              {isDemo ? t('dashboard.exit_demo') : t('nav.sign_out')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
