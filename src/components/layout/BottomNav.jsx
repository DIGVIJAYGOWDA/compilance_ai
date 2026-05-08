import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, BarChart2, Settings } from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/analytics', icon: BarChart2, label: t('nav.analytics') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden z-30 pb-safe">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
              ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            <item.icon size={20} className={({ isActive }) => isActive ? 'fill-blue-50/50' : ''} />
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
