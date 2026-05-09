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
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1a2d44] to-[#0D1B2A] flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">ComplianceAI</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-white/50 hover:text-red-400 text-sm transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-500/30">
              <CheckCircle2 size={12} /> Welcome back, {user?.email?.split('@')[0]}
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Select a Business</h1>
            <p className="text-white/50 text-sm">Choose which business dashboard you want to manage</p>
          </div>

          {/* Business Cards */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
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
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleSelect(biz)}
                      className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 flex items-center gap-5 transition-all duration-200 text-left"
                    >
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon size={24} className="text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-base truncate">{biz.business_name}</div>
                        <div className="text-white/40 text-sm capitalize">{biz.business_type?.replace('_', ' ')} · {biz.city}</div>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full">
                          <Building2 size={10} />
                          {count} license{count !== 1 ? 's' : ''} tracked
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={20} className="text-white/30 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                    </motion.button>
                  );
                })}

                {/* Add New Business Card */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: businesses.length * 0.08 }}
                  onClick={handleAddNew}
                  className="w-full group border-2 border-dashed border-white/20 hover:border-blue-500/60 rounded-2xl p-5 flex items-center gap-5 transition-all duration-200 hover:bg-blue-500/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-blue-500/20 border-2 border-dashed border-white/20 group-hover:border-blue-500/50 flex items-center justify-center flex-shrink-0 transition-all">
                    <Plus size={24} className="text-white/30 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-white/50 group-hover:text-white transition-colors">Add New Business</div>
                    <div className="text-white/30 text-sm">Register another business to track</div>
                  </div>
                  <ArrowRight size={20} className="text-white/20 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                </motion.button>
              </div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!loading && businesses.length === 0 && (
            <div className="text-center py-10">
              <div className="text-white/30 text-sm mb-4">No businesses registered yet.</div>
              <button onClick={handleAddNew} className="btn-primary">
                <Plus size={16} /> Register Your First Business
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
