import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Building2, Award, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { formatCurrency } from '../utils/formatters';

const STATS = [
  { label: 'Small Businesses in India', value: '63M+', icon: Building2, color: 'text-blue-600' },
  { label: 'Licenses Required Per Business', value: '8–12', icon: Award, color: 'text-purple-600' },
  { label: 'Max Penalty Per Lapse', value: '₹5,00,000', icon: AlertTriangle, color: 'text-red-600' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📸', title: 'Scan Your License', desc: 'Photograph any government license document. Our AI reads and extracts all details instantly.' },
  { step: '02', icon: '🎯', title: 'Track Everything', desc: 'One dashboard for all your licenses — FSSAI, Fire NOC, Trade License, GST and more.' },
  { step: '03', icon: '🔔', title: 'Never Miss a Date', desc: 'Smart reminders at 60, 30, 7, and 1 day before expiry. Never pay a fine again.' },
];

const DEMO_TABLE = [
  { name: 'FSSAI Food License', expiry: '12 days ago', status: 'expired' },
  { name: 'Fire NOC', expiry: '8 days left', status: 'expiring' },
  { name: 'Trade License', expiry: '23 days left', status: 'expiring' },
  { name: 'Shop & Establishment', expiry: '52 days left', status: 'active' },
  { name: 'GST Registration', expiry: '240 days left', status: 'active' },
  { name: 'Eating House License', expiry: '180 days left', status: 'active' },
];

function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const num = parseInt(target.replace(/\D/g, ''));
    if (!num) return;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(num * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{target.replace(/[\d]+/, count.toLocaleString('en-IN'))}</>;
}

export default function Landing() {
  const { enterDemo } = useDemo();
  const navigate = useNavigate();

  const handleDemo = () => {
    enterDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ComplianceAI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDemo} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2">
              Try Demo
            </button>
            <Link to="/onboard" className="btn-primary py-2 text-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)'
        }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm border border-white/30">
              <Zap size={14} className="text-yellow-300" /> Trusted by 500+ Bengaluru businesses
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Never lose your business<br />to an expired license
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              ComplianceAI tracks all your government licenses, sends smart reminders,
              and pre-fills renewal forms — automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboard" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-base px-8 py-4 flex items-center justify-center gap-2">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <button onClick={handleDemo} className="btn-secondary border-white/50 text-white hover:bg-white/10 text-base px-8 py-4">
                See Live Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`text-4xl font-black mb-2 ${stat.color}`}>
                  <CountUp target={stat.value} />
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-label">How It Works</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3">Three steps to full compliance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card text-center hover:shadow-card-hover transition-shadow"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
                <div className="section-label mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="section-label">The Problem We Solve</span>
            <h2 className="text-3xl font-black text-gray-900 mt-3">Most businesses are non-compliant without knowing it</h2>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">License</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_TABLE.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          row.status === 'expired' ? 'bg-red-100 text-red-700' :
                          row.status === 'expiring' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {row.status === 'expired' ? 'Expired' : row.status === 'expiring' ? 'Expiring' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-red-50 border-t border-red-100 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-semibold text-red-700">
                ⚠️ This business has 3 expired/expiring licenses. Total penalty exposure: <strong>₹1,35,000</strong>
              </div>
              <button onClick={handleDemo} className="btn-primary py-2 text-sm whitespace-nowrap">
                See How We Fix This
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy py-12 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">ComplianceAI</span>
        </div>
        <p className="text-gray-400 text-sm">Made for Indian Businesses · Bengaluru, Karnataka</p>
      </footer>
    </div>
  );
}
