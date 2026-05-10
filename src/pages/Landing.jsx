import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Activity, Terminal, ShieldCheck, CheckCircle, Quote } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import toast from 'react-hot-toast';

const STATS = [
  { number: '63M+', label: 'Small Businesses in India' },
  { number: '8-12', label: 'Licenses Required Per Business' },
  { number: '₹5L', label: 'Max Penalty Per Lapse' },
];

const HOW = [
  { icon: <Activity size={24} strokeWidth={1.5} />, title: '01. Connect', desc: 'Photograph any license document — AI extracts all fields and connects it to your compliance dashboard automatically.' },
  { icon: <Terminal size={24} strokeWidth={1.5} />, title: '02. Map', desc: 'The system autonomously maps regulatory expiry frameworks against your current operational state in real-time.' },
  { icon: <CheckCircle size={24} strokeWidth={1.5} />, title: '03. Maintain', desc: 'Automated remediation tasks and smart email reminders are dispatched 60, 30, and 7 days before expiry.' },
];

const SAMPLE_LICENSES = [
  { name: 'FSSAI Food License', days: -12, status: 'expired', penalty: '₹25,000', esc: '+2.5%', risk: 90 },
  { name: 'Fire NOC Compliance', days: 8, status: 'expiring', penalty: '₹50,000', esc: '+0.8%', risk: 60 },
  { name: 'Trade License Section 40A', days: 23, status: 'expiring', penalty: '₹10,000', esc: '+0.1%', risk: 40 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { enterDemo } = useDemo();

  const handleDemo = () => {
    enterDemo();
    navigate('/dashboard');
    toast.success('🎉 Demo mode loaded — explore all features!');
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',system-ui,sans-serif] antialiased [text-rendering:optimizeLegibility]">
      {/* Global CSS Grid Background for Top & Bottom Sections */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Navbar */}
      <nav className="relative z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ComplianceAI" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-tight text-gray-900 text-2xl">ComplianceAI</span>
          </div>
          


          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/onboard')} className="bg-blue-600 text-white text-[13px] font-bold px-6 py-2.5 hover:bg-blue-700 transition-colors shadow-md rounded-md">
              Sign In
            </button>
            <button onClick={handleDemo} className="border border-gray-200 bg-white text-gray-700 text-[13px] font-bold px-5 py-2.5 hover:bg-gray-50 transition-colors shadow-sm rounded-md flex items-center gap-1.5 ml-2">
              <Activity size={14} /> Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section Wrapper */}
      <div className="relative w-full bg-[#0D1B2A] overflow-hidden">
        {/* Background Video & Overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-80"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A]/40 via-[#0D1B2A]/70 to-[#f8fafc]"></div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 pt-24 pb-32 px-6 max-w-[1200px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            <h1 className="text-6xl md:text-[72px] font-[500] tracking-tight text-white leading-[1.1] mb-6 max-w-4xl mx-auto drop-shadow-sm">
              Compliance, solved with<br />architectural precision.
            </h1>
            
            <p className="text-[20px] text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              Automate your regulatory hygiene with a system built for technical reliability and absolute transparency. No decorative noise, just pure operational clarity.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => navigate('/onboard')} className="bg-[#10b981] text-white text-[15px] font-bold px-10 py-4 hover:bg-[#059669] transition-colors shadow-lg shadow-[#10b981]/20 rounded-xl">
                Get Started
              </button>
            </div>
          </motion.div>

          {/* Hero Mockup Grid */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} 
            className="mt-20 grid lg:grid-cols-12 gap-6 text-left relative z-20">
          
          {/* Main Dashboard UI Mockup - Replica of Actual App */}
          <div className="lg:col-span-8 bg-[#f4f6f8] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden border border-gray-200 flex h-[400px]">
            
            {/* Mini Sidebar */}
            <div className="w-[22%] bg-[#0D1B2A] flex flex-col justify-between p-3">
              <div>
                <div className="flex items-center gap-1.5 mb-6 px-1">
                  <img src="/logo.png" alt="ComplianceAI" className="w-4 h-4 object-contain" />
                  <span className="text-white text-[10px] font-bold tracking-tight">ComplianceAI</span>
                </div>
                <div className="space-y-1">
                  <div className="bg-[#1e40af] text-white rounded-md px-2 py-1.5 text-[8px] font-medium flex items-center gap-2">
                    <Activity size={8} /> Dashboard
                  </div>
                  <div className="text-gray-400 hover:text-white px-2 py-1.5 text-[8px] font-medium flex items-center gap-2">
                    <CheckCircle size={8} /> Analytics
                  </div>
                  <div className="text-gray-400 hover:text-white px-2 py-1.5 text-[8px] font-medium flex items-center gap-2">
                    <Terminal size={8} /> Settings
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="text-[7px] text-gray-400 font-medium">Spice Garden Restaurant</div>
                <div className="text-[6px] text-gray-500 truncate">bengaluru@spicegarden.com</div>
              </div>
            </div>

            {/* Mini Main Area */}
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
              
              {/* Header Banner */}
              <div className="bg-[#0D1B2A] rounded-xl p-4 flex items-center justify-between text-white shrink-0">
                <div>
                  <div className="text-[8px] text-gray-400 mb-0.5">Good evening 👋</div>
                  <div className="text-[14px] font-bold mb-0.5">Rajesh Kumar</div>
                  <div className="text-[7px] text-gray-400">Spice Garden Restaurant · Bengaluru</div>
                  <div className="mt-2 inline-block bg-white/10 px-2 py-0.5 rounded text-[7px]">Grade B — Mostly Compliant</div>
                </div>
                <div className="flex flex-col items-center">
                  {/* Mini score ring */}
                  <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 border-t-blue-200 flex flex-col items-center justify-center">
                    <span className="text-[14px] font-bold leading-none">61</span>
                    <span className="text-[4px] uppercase tracking-widest text-gray-400 mt-0.5">Score</span>
                  </div>
                </div>
              </div>

              {/* Alert Banner */}
              <div className="bg-red-50 border border-red-100 rounded-md p-2 flex items-center gap-2 text-red-600 shrink-0">
                <div className="text-[8px] font-bold">⚠️ 1 licenses expired - Total penalty exposure: ₹5K</div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 shrink-0">
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <div className="text-[6px] text-gray-400 font-bold tracking-widest uppercase mb-1">Total Licenses</div>
                  <div className="text-[14px] font-bold text-blue-600">6</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <div className="text-[6px] text-gray-400 font-bold tracking-widest uppercase mb-1">Expired</div>
                  <div className="text-[14px] font-bold text-red-500">1</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <div className="text-[6px] text-gray-400 font-bold tracking-widest uppercase mb-1">Expiring This Month</div>
                  <div className="text-[14px] font-bold text-amber-500">2</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-2">
                  <div className="text-[6px] text-gray-400 font-bold tracking-widest uppercase mb-1">Compliant</div>
                  <div className="text-[14px] font-bold text-[#10b981]">2</div>
                </div>
              </div>

              {/* Cards Header */}
              <div className="flex items-center justify-between shrink-0 mt-1">
                <div className="text-[10px] font-bold text-gray-900">Your Licenses</div>
                <div className="bg-blue-600 text-white text-[7px] px-2 py-1 rounded">+ Add License</div>
              </div>

              {/* License Cards Grid */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {/* Expired Card */}
                <div className="bg-white border border-red-200 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[8px] font-bold text-gray-900">FSSAI Food License</div>
                      <div className="text-[6px] text-gray-500">Food Safety and Standards...</div>
                    </div>
                    <div className="bg-red-50 text-red-600 text-[6px] px-1.5 py-0.5 rounded-full font-medium">Expired</div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="w-6 h-6 rounded-full border border-red-200 flex items-center justify-center">
                      <span className="text-[5px] text-red-500 font-bold">EXP</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-bold text-red-600 leading-none">12d</div>
                      <div className="text-[6px] text-red-400">overdue</div>
                      <div className="text-[6px] text-red-600 font-bold">₹5K fine</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50 grid grid-cols-2 gap-1">
                    <div className="bg-gray-50 text-gray-600 text-[6px] text-center py-1 rounded">View Details</div>
                    <div className="bg-red-600 text-white text-[6px] text-center py-1 rounded">Renew Now</div>
                  </div>
                </div>

                {/* Expiring Card */}
                <div className="bg-white border border-amber-200 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[8px] font-bold text-gray-900">Fire NOC</div>
                      <div className="text-[6px] text-gray-500">Karnataka State Fire...</div>
                    </div>
                    <div className="bg-amber-50 text-amber-600 text-[6px] px-1.5 py-0.5 rounded-full font-medium">Expiring Soon</div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="w-6 h-6 rounded-full border border-amber-200 flex items-center justify-center">
                      <span className="text-[6px] font-bold">8d</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-bold text-amber-500 leading-none">8d</div>
                      <div className="text-[6px] text-gray-400">days left</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50 grid grid-cols-2 gap-1">
                    <div className="bg-gray-50 text-gray-600 text-[6px] text-center py-1 rounded">View Details</div>
                    <div className="bg-amber-500 text-white text-[6px] text-center py-1 rounded">Renew Now</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-white border border-gray-100 p-8 shadow-sm flex flex-col justify-center rounded-xl">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center mb-6">
                <div className="w-4 h-4 border border-gray-900 rounded-sm" />
              </div>
              <h3 className="text-[20px] font-medium text-gray-900 mb-2">Automated Extraction</h3>
              <p className="text-[15px] text-gray-500 font-light leading-relaxed">
                Immutable audit trails for every regulatory interaction across your entire stack using AI parsing.
              </p>
            </div>
            
            <div className="flex-1 bg-[#0D1B2A] border border-gray-800 p-8 shadow-sm flex flex-col justify-center rounded-xl">
              <div className="bg-[#10b981]/20 text-[#10b981] text-[11px] font-bold tracking-widest px-3 py-1 w-max mb-6 rounded-md">API</div>
              <h3 className="text-[20px] font-medium text-white mb-2">API-First Execution</h3>
              <p className="text-[15px] text-gray-400 font-light leading-relaxed">
                Integration that treats compliance as a primary software constraint, not an afterthought.
              </p>
            </div>
          </div>
        </motion.div>

      </section>
      </div>

      {/* Features Section */}
      <section className="relative z-10 bg-[#f8fafc] py-32 px-6 border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16 text-center">
            <span className="text-[12px] font-bold tracking-[0.2em] text-[#059669] uppercase block mb-4">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-[500] tracking-tight text-gray-900">What are the features we are providing?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-3">Automated Tracking</h3>
              <p className="text-[16px] text-gray-800 font-medium leading-relaxed">
                We continuously monitor your compliance status against real-time regulatory changes, ensuring you are never caught off-guard.
              </p>
            </div>
            
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center mb-6">
                <Activity size={24} />
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-3">Penalty Projections</h3>
              <p className="text-[16px] text-gray-800 font-medium leading-relaxed">
                Advanced risk modeling algorithms calculate your exact financial exposure for any delayed or missed compliance filings.
              </p>
            </div>
            
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Terminal size={24} />
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-3">API-First Integrations</h3>
              <p className="text-[16px] text-gray-800 font-medium leading-relaxed">
                Seamlessly connect our compliance engine to your existing HR, Finance, and Operations software stacks via our robust API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Protocol (How it works) */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-[1200px] mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-[500] tracking-tight text-gray-900">The Integration Protocol</h2>
        </div>

        <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-12">
          {HOW.map((h, i) => (
            <div key={i} className="relative">
              {/* Optional: Add a faint connecting line between steps on desktop */}
              {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[1px] bg-gray-200" />}
              
              <div className="text-gray-900 mb-6 bg-white w-max relative z-10 pr-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {h.icon}
                </div>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-4">{h.title}</h3>
              <p className="text-[18px] text-gray-800 font-medium leading-relaxed max-w-[320px]">
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote / Dark Section */}
      <section className="relative z-10 bg-[#0D1B2A] py-32 px-6 rounded-t-3xl overflow-hidden mx-2 md:mx-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <Quote size={48} className="text-[#10b981] mb-8" strokeWidth={3} />
          
          <h2 className="text-3xl md:text-4xl font-serif italic text-gray-300 leading-relaxed mb-12 font-light">
            "The era of manual compliance is dead. Regulatory hygiene is no longer a checklist—it is a mathematical certainty woven directly into the fabric of enterprise architecture."
          </h2>
          
          <div>
            <div className="text-[14px] font-bold tracking-[0.2em] text-[#10b981] uppercase mb-2">Core Engineering Principle</div>
            <div className="text-[12px] tracking-[0.1em] text-gray-500 uppercase">The Compliance Manifesto</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[18px] text-gray-800 font-bold flex items-center justify-center gap-2">
            <img src="/logo.png" alt="ComplianceAI" className="w-6 h-6 object-contain" />
            ComplianceAI — Built with love in Bangalore
          </p>
        </div>
      </footer>
    </div>
  );
}
