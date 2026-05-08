import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, FileText, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../hooks/useAuth';
import { useLicenses } from '../hooks/useLicenses';
import { calculateComplianceScore, getLicenseSummary } from '../utils/complianceScore';
import { formatCurrency, getGreeting } from '../utils/formatters';
import { getLicenseById, LICENSE_TYPES } from '../utils/licenseTypes';
import { PENALTY_RULES } from '../utils/penaltyRules';
import ComplianceRing from '../components/ui/ComplianceRing';
import LicenseCard from '../components/ui/LicenseCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import ConfettiAnimation from '../components/ui/ConfettiAnimation';
import ScanModal from '../components/features/ScanModal';
import ChatBot from '../components/features/ChatBot';
import { getBusiness } from '../services/supabase';

const SORT_OPTIONS = [
  { value: 'urgent', label: 'Most Urgent' },
  { value: 'az', label: 'A–Z' },
  { value: 'recent', label: 'Recently Added' },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { isDemo, demoBusiness, demoLicenses } = useDemo();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [sort, setSort] = useState('urgent');
  const [scanOpen, setScanOpen] = useState(false);

  const { licenses, sortedLicenses, loading, addLicense } = useLicenses(
    business?.id,
    isDemo ? demoLicenses : null
  );

  const displayBusiness = isDemo ? demoBusiness : business;
  const scoreData = calculateComplianceScore(licenses);
  const summary = getLicenseSummary(licenses);

  // Total penalty exposure for expired licenses
  const totalPenalty = licenses
    .filter(l => l.status === 'expired')
    .reduce((acc, l) => {
      const rule = PENALTY_RULES[l.license_type];
      return acc + (rule?.slabs?.[0]?.fine || 0);
    }, 0);

  useEffect(() => {
    if (!isDemo && user) {
      getBusiness(user.id).then(setBusiness).catch(() => {});
    }
  }, [user, isDemo]);

  const sortedDisplay = [...(sortedLicenses)].sort((a, b) => {
    if (sort === 'az') return (a.license_type || '').localeCompare(b.license_type || '');
    if (sort === 'recent') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    return a.daysLeft - b.daysLeft; // urgent (lowest daysLeft first)
  });

  const expiredCount = licenses.filter(l => l.status === 'expired').length;

  return (
    <div className="space-y-6">
      <ConfettiAnimation trigger={scoreData.score === 100} />

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold">{t('dashboard.demo_banner')}</span>
        </div>
      )}

      {/* Header Health Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <p className="text-blue-300 font-medium mb-1">{getGreeting()}, {displayBusiness?.owner_name?.split(' ')[0] || 'there'} 👋</p>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            {displayBusiness?.business_name || 'My Business'}
          </h1>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {displayBusiness?.city || 'Bengaluru'}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: summary.total, color: 'text-white' },
              { label: 'Expiring', value: summary.expiringMonth, color: 'text-amber-400' },
              { label: 'Expired', value: summary.expired, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <ComplianceRing score={scoreData.score} colorHex={scoreData.colorHex} grade={scoreData.grade} size={150} strokeWidth={12} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-white">{t('dashboard.compliance_score')}</div>
            <div className="text-xs mt-1 px-3 py-1 rounded-full font-bold" style={{ color: scoreData.colorHex, background: `${scoreData.colorHex}20` }}>
              {scoreData.grade} — {scoreData.message}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Banner */}
      {expiredCount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 pulse-urgent"
        >
          <div className="text-sm font-semibold text-red-700">
            ⚠️ {t('dashboard.alert_expired', { count: expiredCount })} <strong>{formatCurrency(totalPenalty)}</strong>
          </div>
        </motion.div>
      )}

      {/* License Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-gray-900">Your Licenses</h2>
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSort(o.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === o.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : sortedDisplay.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('dashboard.no_licenses')}
            subtitle={t('dashboard.no_licenses_sub')}
            action={
              <button onClick={() => setScanOpen(true)} className="btn-primary flex items-center gap-2">
                <Camera size={16} /> Scan Your First License
              </button>
            }
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {sortedDisplay.map((lic) => (
              <motion.div
                key={lic.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              >
                <LicenseCard license={lic} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* FAB — Scan Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setScanOpen(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 w-14 h-14 bg-blue-600 rounded-full shadow-glow flex items-center justify-center text-white z-20"
      >
        <Camera size={22} />
      </motion.button>

      {/* ChatBot */}
      <ChatBot />

      {/* Scan Modal */}
      <ScanModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onSave={addLicense}
        businessId={business?.id}
        isDemo={isDemo}
      />
    </div>
  );
}
