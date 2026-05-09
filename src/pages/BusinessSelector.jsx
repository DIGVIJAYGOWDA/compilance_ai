import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Plus, ArrowRight, LogOut, Building2, ChevronRight,
  UtensilsCrossed, Scissors, ShoppingBag, Stethoscope,
  HardHat, GraduationCap, Factory, Briefcase, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../context/BusinessContext';
import { signOut, getLocalToken } from '../services/supabase';
import { checkAndSendReminders } from '../services/reminderService';

const ICON_MAP = {
  restaurant: UtensilsCrossed,
  salon: Scissors,
  retail: ShoppingBag,
  clinic: Stethoscope,
  construction: HardHat,
  education: GraduationCap,
  manufacturing: Factory,
};

const TYPE_COLORS = {
  restaurant: 'from-orange-500 to-red-500',
  salon: 'from-pink-500 to-purple-500',
  retail: 'from-blue-500 to-cyan-500',
  clinic: 'from-green-500 to-teal-500',
  construction: 'from-yellow-500 to-orange-500',
  education: 'from-indigo-500 to-blue-500',
  manufacturing: 'from-gray-500 to-slate-600',
};

function getBusinessIcon(type) {
  return ICON_MAP[type] || Briefcase;
}

function getBusinessGradient(type) {
  return TYPE_COLORS[type] || 'from-blue-500 to-indigo-600';
}

async function fetchAllBusinesses(userId) {
  const token = getLocalToken();
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${url}/rest/v1/businesses?owner_id=eq.${userId}&order=created_at.asc`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  return await res.json();
}

async function getLicenseCount(businessId) {
  const token = getLocalToken();
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(
    `${url}/rest/v1/licenses?business_id=eq.${businessId}&select=id`,
    { headers: { 'apikey': key, 'Authorization': `Bearer ${token}`, 'Prefer': 'count=exact' } }
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.length;
}

export default function BusinessSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectBusiness } = useBusiness();
  const [businesses, setBusinesses] = useState([]);
  const [licenseCounts, setLicenseCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAllBusinesses(user.id).then(async (list) => {
      setBusinesses(list);
      // Fetch license counts in parallel
      const counts = {};
      await Promise.all(list.map(async (biz) => {
        counts[biz.id] = await getLicenseCount(biz.id);
      }));
      setLicenseCounts(counts);
      setLoading(false);
    });
  }, [user]);

  const handleSelect = async (biz) => {
    selectBusiness(biz);
    toast.success(`Switched to ${biz.business_name}`);
    navigate('/dashboard');

    // Fire reminder check in the background (non-blocking)
    try {
      const token = getLocalToken();
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(
        `${url}/rest/v1/licenses?business_id=eq.${biz.id}&order=expiry_date.asc`,
        { headers: { 'apikey': key, 'Authorization': `Bearer ${token}` } }
      );
      const licenses = res.ok ? await res.json() : [];
      checkAndSendReminders(biz, licenses);
    } catch (e) {
      console.warn('[Reminders] Could not check reminders:', e.message);
    }
  };

  const handleAddNew = () => {
    navigate('/onboard?mode=add-business');
  };

  const handleSignOut = () => {
    signOut().catch(console.error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Plus_Jakarta_Sans',system-ui,sans-serif] antialiased" style={{textRendering:'optimizeLegibility'}}>

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-8 py-5 bg-[#0D1B2A] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#ff4f37] rounded-xl flex items-center justify-center shadow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-[800] text-xl tracking-tight">ComplianceAI</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="flex items-center gap-2 bg-red-500 text-white border border-red-400 hover:bg-red-600 hover:shadow-lg text-[13px] font-bold transition-all px-4 py-2.5 rounded-xl"
        >
          <LogOut size={16} /> Sign Out
        </motion.button>
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-[800] text-[#0c0c1d] mb-2 tracking-[-0.02em]">Select a Business</h1>
            <p className="text-gray-500 text-[15px] font-['DM_Sans']">Choose which business dashboard you want to manage</p>
          </div>

          {/* Business Cards */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {businesses.map((biz, i) => {
                  const Icon = getBusinessIcon(biz.business_type);
                  const gradient = getBusinessGradient(biz.business_type);
                  const count = licenseCounts[biz.id] ?? '...';
                  return (
                    <motion.button
                      key={biz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 25 }}
                      onClick={() => handleSelect(biz)}
                      className="w-full group bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] hover:from-white hover:to-white border border-slate-200 hover:border-[#ff4f37] hover:shadow-[0_8px_30px_rgba(255,79,55,0.1)] rounded-2xl p-5 flex items-center gap-5 transition-all duration-200 text-left"
                    >
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon size={24} className="text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#0c0c1d] text-base truncate">{biz.business_name}</div>
                        <div className="text-gray-500 text-sm capitalize font-['DM_Sans']">{biz.business_type?.replace('_', ' ')} · {biz.city}</div>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 font-medium text-xs px-2.5 py-1 rounded-full">
                          <Building2 size={10} />
                          {count} license{count !== 1 ? 's' : ''} tracked
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#ff4f37] flex-shrink-0 transition-colors" />
                    </motion.button>
                  );
                })}

                {/* Add New Business */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: businesses.length * 0.08, type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={handleAddNew}
                  className="w-full group border-2 border-dashed border-gray-200 hover:border-[#ff4f37] hover:bg-[#fffcfc] hover:shadow-[0_8px_30px_rgba(255,79,55,0.08)] rounded-2xl p-5 flex items-center gap-5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-[#fff5f3] border-2 border-dashed border-gray-200 group-hover:border-[#ffd5cc] flex items-center justify-center flex-shrink-0 transition-all">
                    <Plus size={24} className="text-gray-400 group-hover:text-[#ff4f37] transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-600 group-hover:text-[#0c0c1d] transition-colors">Add New Business</div>
                    <div className="text-gray-500 text-sm font-['DM_Sans']">Register another business to track</div>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-[#ff4f37] flex-shrink-0 transition-colors" />
                </motion.button>
              </div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!loading && businesses.length === 0 && (
            <div className="text-center py-10">
              <div className="text-gray-500 text-sm mb-4 font-['DM_Sans']">No businesses registered yet.</div>
              <button onClick={handleAddNew} className="bg-[#ff4f37] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto hover:bg-[#e03a25] transition-colors">
                <Plus size={16} /> Register Your First Business
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
