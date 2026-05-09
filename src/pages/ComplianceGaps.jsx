import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, AlertTriangle, FileText, Clock, IndianRupee,
  ExternalLink, CheckCircle2, Building2, ChevronDown, ChevronUp
} from 'lucide-react';
import { analyzeComplianceGap } from '../services/geminiService';
import { useLicenses } from '../hooks/useLicenses';
import { useDemo } from '../context/DemoContext';

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="grid grid-cols-3 gap-3 mt-2">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

function LicenseGapCard({ missing, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{missing.license_name}</h3>
              <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded">
                Mandatory
              </span>
            </div>
            {missing.issuing_authority && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Building2 size={11} />
                {missing.issuing_authority}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{missing.reason}</p>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
        >
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-px bg-gray-100 border-t border-gray-100">
        <div className="bg-white px-4 py-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <IndianRupee size={10} /> Approx. Cost
          </div>
          <div className="text-sm font-bold text-gray-800">{missing.estimated_cost || 'Varies'}</div>
        </div>
        <div className="bg-white px-4 py-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Clock size={10} /> Time
          </div>
          <div className="text-sm font-bold text-gray-800">{missing.estimated_time || 'Varies'}</div>
        </div>
        <div className="bg-red-50/60 px-4 py-3">
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <AlertTriangle size={10} /> Penalty Risk
          </div>
          <div className="text-sm font-bold text-red-600 leading-tight">{missing.penalty_risk || '—'}</div>
        </div>
      </div>

      {/* Expandable section */}
      {open && (
        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/50">
          {missing.documents_required?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Documents Required</h4>
              <ul className="space-y-1.5">
                {missing.documents_required.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {missing.portal_url && (
            <a
              href={missing.portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl"
            >
              <ExternalLink size={14} />
              Apply on Official Portal
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function ComplianceGaps() {
  const navigate = useNavigate();
  const { business } = useOutletContext();
  const { isDemo, demoLicenses } = useDemo();
  const { licenses, loading } = useLicenses(isDemo ? null : business?.id, isDemo ? demoLicenses : null);

  const [missingLicenses, setMissingLicenses] = useState([]);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    if (loading || !business) return;

    // Use the SAME cache key as Dashboard — never duplicate API calls
    const cacheKey = `compliance_gaps_${business.id}_${licenses.length}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try { setMissingLicenses(JSON.parse(cached)); } catch { /* ignore */ }
      setAnalyzing(false);
      return;
    }

    // Only call Gemini if absolutely no cache exists
    setAnalyzing(true);
    analyzeComplianceGap(business, licenses).then(res => {
      if (res.data) {
        setMissingLicenses(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
        localStorage.setItem('compliance_gaps', JSON.stringify(res.data));
      }
    }).finally(() => setAnalyzing(false));
  }, [loading, business, licenses?.length]);

  const totalPenalty = missingLicenses.reduce((sum, m) => sum + (m.estimated_penalty_per_year || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Compliance Gaps</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Mandatory licenses missing for {business?.business_name || 'your business'} in {business?.city || 'your area'}
          </p>
        </div>
      </motion.div>

      {/* Summary banner */}
      {!analyzing && missingLicenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <div className="font-bold text-red-900 text-sm">
                {missingLicenses.length} mandatory license{missingLicenses.length > 1 ? 's' : ''} missing
              </div>
              {totalPenalty > 0 && (
                <div className="text-xs text-red-600 mt-0.5">
                  Potential penalty exposure: ₹{(totalPenalty / 100000).toFixed(2)} Lakhs / year
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-red-400 font-medium flex-shrink-0">AI Analysis</div>
        </motion.div>
      )}

      {/* Cards */}
      {analyzing ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
        </div>
      ) : missingLicenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
          <div className="font-bold text-gray-900 mb-1">Fully Compliant!</div>
          <div className="text-sm text-gray-500">No mandatory licenses appear to be missing based on your uploads.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {missingLicenses.map((m, i) => (
            <LicenseGapCard key={i} missing={m} index={i} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center pb-4">
        This analysis is AI-generated based on common government mandates. Always verify with your local authority.
      </p>
    </div>
  );
}
