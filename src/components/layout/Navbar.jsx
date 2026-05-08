import { useTranslation } from 'react-i18next';
import { Bell, Menu, Shield } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ toggleSidebar, score }) {
  const { t } = useTranslation();
  const { isDemo, demoBusiness } = useDemo();
  const { user } = useAuth();

  const businessName = isDemo ? demoBusiness?.business_name : user?.email || 'My Business';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 lg:hidden text-gray-600"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white lg:hidden">
            <Shield size={18} />
          </div>
          <h2 className="font-semibold text-gray-800 hidden sm:block truncate max-w-[200px]">
            {businessName}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Score Mini Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <div className={`w-2.5 h-2.5 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className="text-sm font-bold text-gray-700">{score}</span>
        </div>

        <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          {score < 100 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
    </header>
  );
}
