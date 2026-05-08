import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, FileText, MapPin, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../hooks/useAuth';
import { getLicenses, getBusiness } from '../services/supabase';
import { getLicenseById } from '../utils/licenseTypes';
import { formatDate, getDaysLeft } from '../utils/formatters';
import StatusBadge from '../components/ui/StatusBadge';
import PenaltyCalculator from '../components/features/PenaltyCalculator';
import RenewalForm from '../components/features/RenewalForm';
import OfficeLocator from '../components/features/OfficeLocator';
import * as Icons from 'lucide-react';

export default function LicenseDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isDemo, demoLicenses, demoBusiness } = useDemo();
  const { user } = useAuth();
  const [license, setLicense] = useState(null);
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState('penalty');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (isDemo) {
        const found = demoLicenses?.find(l => l.id === id);
        setLicense(found ? { ...found, daysLeft: getDaysLeft(found.expiry_date) } : null);
        setBusiness(demoBusiness);
        setLoading(false);
        return;
      }
      try {
        const biz = await getBusiness(user?.id);
        setBusiness(biz);
        const lics = await getLicenses(biz?.id);
        const found = lics.find(l => l.id === id);
        setLicense(found ? { ...found, daysLeft: getDaysLeft(found.expiry_date) } : null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isDemo, user]);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-10 w-32 rounded-xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );

  if (!license) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">License not found</p>
      <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
    </div>
  );

  const def = getLicenseById(license.license_type);
  const Icon = def ? (Icons[def.icon] || Icons.FileText) : Icons.FileText;
  const daysLeft = license.daysLeft;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

  const TABS = [
    { id: 'penalty', label: '⚖️ Penalty' },
    { id: 'renewal', label: '📋 Renew' },
    { id: 'office', label: '📍 Office' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors">
        <ArrowLeft size={16} /> {t('common.back')} to Dashboard
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy rounded-3xl p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon size={28} className="text-blue-300" />
            </div>
            <div>
              <StatusBadge status={license.status} large />
              <h1 className="text-2xl font-black text-white mt-2">{def?.name || license.license_type}</h1>
              <p className="text-gray-400 text-sm mt-1">{def?.issuing_authority || license.issuing_authority}</p>
            </div>
          </div>
          <div className="text-center bg-white/5 rounded-2xl px-6 py-4 border border-white/10">
            <div className={`text-5xl font-black ${isOverdue ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-green-400'}`}>
              {daysLeft === null ? '—' : Math.abs(daysLeft)}
            </div>
            <div className="text-sm text-gray-400 mt-1 font-medium">
              {isOverdue ? 'Days Overdue' : t('dashboard.days_left')}
            </div>
            <div className="text-xs text-gray-500 mt-1">Exp: {formatDate(license.expiry_date)}</div>
          </div>
        </div>
      </motion.div>

      {/* License Info Grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">License Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: t('license.license_number'), value: license.license_number || '—' },
            { label: t('license.issuing_authority'), value: def?.issuing_authority || license.issuing_authority || '—' },
            { label: t('license.issue_date'), value: formatDate(license.issue_date) },
            { label: t('license.expiry_date'), value: formatDate(license.expiry_date) },
            { label: 'AI Confidence', value: license.confidence_score ? `${license.confidence_score}%` : '—' },
            { label: 'Business', value: business?.business_name || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <div className="section-label mb-1">{label}</div>
              <div className="text-sm font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {(isOverdue || isExpiring) && (
        <div>
          <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card">
            {activeTab === 'penalty' && (
              <div>
                <h2 className="section-title mb-4">⚖️ {t('license.penalty_exposure')}</h2>
                <PenaltyCalculator licenseType={license.license_type} daysLeft={daysLeft} />
              </div>
            )}
            {activeTab === 'renewal' && (
              <div>
                <h2 className="section-title mb-4">📋 {t('license.renew_section')}</h2>
                <RenewalForm license={license} business={business} />
              </div>
            )}
            {activeTab === 'office' && (
              <div>
                <h2 className="section-title mb-4">📍 {t('license.office_locator')}</h2>
                <OfficeLocator licenseType={license.license_type} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Always show renewal section for active licenses too */}
      {!isOverdue && !isExpiring && (
        <div className="card">
          <h2 className="section-title mb-4">📋 {t('license.renew_section')}</h2>
          <RenewalForm license={license} business={business} />
        </div>
      )}
    </div>
  );
}
