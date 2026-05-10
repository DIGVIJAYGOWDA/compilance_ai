import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Plus, ArrowRight, LogOut, Building2, ChevronRight,
  UtensilsCrossed, Scissors, ShoppingBag, Stethoscope,
  HardHat, GraduationCap, Factory, Briefcase, CheckCircle2,
  Search, LayoutGrid, Lock, Zap
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
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col relative overflow-hidden font-['Plus_Jakarta_Sans',system-ui,sans-serif] antialiased">
      {/* Abstract Background Waves (CSS approximation) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 bg-[#0D1B2A] shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ComplianceAI" className="w-8 h-8 object-contain" />
          <span className="text-white font-[800] text-lg tracking-tight">ComplianceAI</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 text-[13px] font-medium transition-colors px-4 py-2 rounded-lg"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </nav>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-[1000px] mx-auto w-full">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-[36px] font-[800] text-[#0c0c1d] mb-2 tracking-tight">Select a Business</h1>
          <p className="text-gray-500 text-[15px]">Choose which business dashboard you want to manage</p>
        </div>

        {/* Toolbar: Search + Add Business Button */}
        <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search businesses..." className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm" />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button className="hidden md:flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-xl text-blue-600 shadow-sm hover:bg-gray-50 transition-colors">
              <LayoutGrid size={20} />
            </button>
            <button onClick={handleAddNew} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-xl font-bold text-[14px] shadow-sm transition-colors">
              <Plus size={18} /> Add New Business
            </button>
          </div>
        </div>

        {/* Business Grid */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[120px] bg-white border border-gray-100 rounded-[1.25rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {businesses.map((biz, i) => {
                  const Icon = getBusinessIcon(biz.business_type);
                  const gradient = getBusinessGradient(biz.business_type);
                  const count = licenseCounts[biz.id] ?? '...';
                  // Let's fake an "Active" badge for the first one like the mockup
                  const isActive = i === 0;

                  return (
                    <motion.button
                      key={biz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelect(biz)}
                      className={`w-full group bg-white border rounded-[1.25rem] p-6 flex items-center gap-5 transition-all duration-200 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.1)] relative overflow-hidden ${isActive ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 hover:border-blue-300'}`}
                    >
                      {isActive && (
                        <div className="absolute top-4 left-6 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Active
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm ${isActive ? 'mt-4' : ''}`}>
                        <Icon size={28} className="text-white" />
                      </div>

                      {/* Info */}
                      <div className={`flex-1 min-w-0 ${isActive ? 'mt-4' : ''}`}>
                        <div className="font-bold text-[#0c0c1d] text-[17px] truncate">{biz.business_name}</div>
                        <div className="text-gray-500 text-[13px] capitalize mb-2">{biz.business_type?.replace('_', ' ')} · {biz.city}</div>
                        <div className="inline-flex items-center gap-1.5 text-gray-500 font-medium text-[12px] bg-gray-50 px-2 py-1 rounded-md">
                          <Lock size={12} />
                          {count} license{count !== 1 ? 's' : ''} tracked
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!loading && businesses.length === 0 && (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-[1.25rem] shadow-sm">
              <div className="text-gray-500 text-sm mb-4">No businesses registered yet.</div>
            </div>
          )}
        </div>

        {/* ── Bottom Features Panel ── */}
        <div className="w-full mt-12 bg-white rounded-[1.25rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex gap-4 items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Shield className="text-blue-600" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] mb-0.5">Centralized Management</div>
              <div className="text-gray-500 text-[12px] leading-snug">Manage all your businesses from one secure dashboard</div>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-gray-100"></div>

          <div className="flex gap-4 items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Lock className="text-blue-600" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] mb-0.5">Secure & Private</div>
              <div className="text-gray-500 text-[12px] leading-snug">Your business data is encrypted and always protected</div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-100"></div>

          <div className="flex gap-4 items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Zap className="text-blue-600" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] mb-0.5">Stay Compliant</div>
              <div className="text-gray-500 text-[12px] leading-snug">Track licenses, renewals, and compliance in one place</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
