import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getLicenseById } from '../../utils/licenseTypes';
import { formatDate } from '../../utils/formatters';

export default function LicenseCard({ license }) {
  const { t } = useTranslation();
  const def = getLicenseById(license.license_type);
  const Icon = def ? Icons[def.icon] : Icons.FileText;

  // Determine border and bg colors based on status
  let borderClass = 'border-gray-100';
  let bgClass = 'bg-white';
  let isPulsing = false;

  if (license.status === 'expired') {
    borderClass = 'border-red-200';
    bgClass = 'bg-red-50/30';
  } else if (license.status === 'expiring') {
    borderClass = 'border-amber-200';
    isPulsing = true; // optional logic, maybe just apply class
  } else if (license.status === 'active') {
    borderClass = 'border-green-100';
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 24px 0 rgba(0,0,0,0.08)' }}
      className={`card ${borderClass} ${bgClass} relative overflow-hidden flex flex-col h-full`}
    >
      {isPulsing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500 animate-pulse" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{def?.name || license.license_type}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{def?.issuing_authority || license.issuing_authority}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="text-center">
          <div className={`text-4xl font-black mb-1 ${
            license.status === 'expired' ? 'text-red-600' :
            license.status === 'expiring' ? 'text-amber-600' : 'text-gray-900'
          }`}>
            {license.daysLeft < 0 ? Math.abs(license.daysLeft) : license.daysLeft === null ? '—' : license.daysLeft}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {license.status === 'expired' ? 'Days Overdue' : t('dashboard.days_left')}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-semibold">Expiry</div>
            <div className="text-sm font-medium text-gray-700">{formatDate(license.expiry_date)}</div>
          </div>
          <StatusBadge status={license.status} />
        </div>

        <div className="flex gap-2">
          <Link to={`/license/${license.id}`} className="btn-secondary flex-1 text-center py-2 text-sm">
            {t('dashboard.view_details')}
          </Link>
          {(license.status === 'expiring' || license.status === 'expired') && (
            <a 
              href={license.renewal_portal_url || def?.renewal_portal} 
              target="_blank" 
              rel="noreferrer"
              className="btn-primary flex-1 text-center py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
            >
              {t('dashboard.renew_now')}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
