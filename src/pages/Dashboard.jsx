import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useDemo } from '../context/DemoContext';
import { useLicenses } from '../hooks/useLicenses';
import { calculateComplianceScore, getLicenseSummary } from '../utils/complianceScore';
import { formatCurrency } from '../utils/formatters';
import { PENALTY_RULES } from '../utils/penaltyRules';
import { getBusiness, createLicense } from '../services/supabase';
import { analyzeComplianceGap } from '../services/geminiService';
import ComplianceRing from '../components/ui/ComplianceRing';
import LicenseCard from '../components/ui/LicenseCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import ScanModal from '../components/features/ScanModal';

function StatCard({ label, value, color = 'text-blue-600', icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</div>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemo, demoLicenses } = useDemo();
  const { business } = useOutletContext();
  const [showScan, setShowScan] = useState(false);
  const [sort, setSort] = useState('urgent');

  const { licenses, loading, addLicense } = useLicenses(
    isDemo ? null : business?.id,
    isDemo ? demoLicenses : null
  );

  const [missingLicenses, setMissingLicenses] = useState([]);
  const [gapLoading, setGapLoading] = useState(false);

  useEffect(() => {
    if (loading || !business || !licenses) return;

    // Build a cache key unique to this business + number of uploaded licenses
    const cacheKey = `compliance_gaps_${business.id}_${licenses.length}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      // Use cached result — no API call needed
      try { setMissingLicenses(JSON.parse(cached)); } catch { /* ignore */ }
      return;
    }

    // Fresh fetch — new business or licenses changed
    setGapLoading(true);
    analyzeComplianceGap(business, licenses).then(res => {
      if (res.data) {
        setMissingLicenses(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
        // Also store for ComplianceGaps detail page
        localStorage.setItem('compliance_gaps', JSON.stringify(res.data));
      }
    }).finally(() => setGapLoading(false));
  }, [loading, business, licenses?.length]);

  // If App.jsx is still loading the business, wait
  if (!isDemo && user && business === undefined) {
    return <div className="p-8 text-center text-gray-500">Loading business profile...</div>;
  }

  const scoreData = calculateComplianceScore(licenses);
  const summary = getLicenseSummary(licenses);

  const totalPenalty = licenses
    .filter(l => l.daysLeft < 0)
    .reduce((sum, l) => {
      const rule = PENALTY_RULES[l.license_type];
      const fine = rule?.slabs?.[0]?.fine || 0;
      return sum + fine;
    }, 0);

  const sorted = [...licenses].sort((a, b) => {
    if (sort === 'urgent') return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
    if (sort === 'az') return (a.license_type || '').localeCompare(b.license_type || '');
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const handleSave = async (fields) => {
    if (isDemo) { toast('Demo mode — data not saved'); throw new Error('Demo mode'); }
    if (!business?.id) throw new Error('No business found');
    
    // Supabase will throw an error if we try to insert columns that don't exist
    const { business_name, ...validFields } = fields;
    
    await addLicense({ 
      ...validFields, 
      business_id: business.id, 
      status: 'active',
      extracted_data: fields
    });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#0D1B2A] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="text-white">
          <div className="text-blue-300 text-sm font-medium mb-1">{greeting} 👋</div>
          <h1 className="text-2xl md:text-3xl font-black leading-tight">
            {business?.owner_name || 'Welcome back'}
          </h1>
          <div className="text-gray-400 text-sm mt-1">{business?.business_name || 'Your Business'} · {business?.city || 'Bengaluru'}</div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${scoreData.score >= 80 ? 'bg-green-900/50 text-green-300' : scoreData.score >= 60 ? 'bg-blue-900/50 text-blue-300' : scoreData.score >= 40 ? 'bg-amber-900/50 text-amber-300' : 'bg-red-900/50 text-red-300'}`}>
              Grade {scoreData.grade} — {scoreData.message}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <ComplianceRing score={scoreData.score} size={130} />
          <div className="text-gray-400 text-xs">{t('dashboard.compliance_score')}</div>
        </div>
      </motion.div>

      {/* Alert banner */}
      {summary.expired > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <div className="font-bold text-red-800 text-sm">⚠️ {summary.expired} {t('dashboard.alert_expired')} {formatCurrency(totalPenalty)}</div>
              <div className="text-red-600 text-xs mt-0.5">Renew immediately to avoid further fines</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('dashboard.total_licenses')} value={summary.total} color="text-blue-600" />
        <StatCard label="Expired" value={summary.expired} color={summary.expired > 0 ? 'text-red-600' : 'text-gray-400'} />
        <StatCard label="Expiring This Month" value={summary.expiringMonth} color={summary.expiringMonth > 0 ? 'text-amber-600' : 'text-gray-400'} />
        <StatCard label={t('dashboard.compliant')} value={summary.active} color="text-green-600" />
      </div>

      {/* License grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Your Licenses</h2>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="urgent">Most Urgent</option>
              <option value="az">A–Z</option>
              <option value="recent">Recently Added</option>
            </select>
            <button onClick={() => setShowScan(true)} className="btn-primary text-sm py-2">
              <Plus size={16} /> Add License
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            title={t('dashboard.no_licenses')}
            description={t('dashboard.no_licenses_sub')}
            action={() => setShowScan(true)}
            actionLabel="Scan Your First License"
            icon={Camera}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((lic, i) => (
              <motion.div key={lic.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <LicenseCard license={lic} onRenew={() => setShowScan(true)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insight Banner */}
      {gapLoading ? (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 bg-amber-200 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-amber-200 rounded w-2/3" />
            <div className="h-2.5 bg-amber-100 rounded w-1/2" />
          </div>
        </div>
      ) : missingLicenses.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">AI Insight</div>
              <div className="text-sm font-bold text-gray-900">
                AI detected {missingLicenses.length} missing mandatory license{missingLicenses.length > 1 ? 's' : ''} for {business?.business_name || 'your business'} in {business?.city || 'your area'}.
              </div>
              {(() => {
                const total = missingLicenses.reduce((s, m) => s + (m.estimated_penalty_per_year || 0), 0);
                return total > 0 ? (
                  <div className="text-xs text-amber-700 mt-0.5">Potential penalty exposure: ₹{(total / 100000).toFixed(2)} Lakhs / year</div>
                ) : null;
              })()}
            </div>
          </div>
          <button
            onClick={() => navigate('/compliance-gaps')}
            className="flex-shrink-0 flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            View Missing Licenses →
          </button>
        </motion.div>
      ) : null}

      {/* Scan Modal */}
      {showScan && <ScanModal onClose={() => setShowScan(false)} onSave={handleSave} />}
    </div>
  );
}
