import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithOtp, verifyOtp, createBusiness } from '../services/supabase';
import { BUSINESS_TYPES } from '../utils/licenseTypes';
import * as Icons from 'lucide-react';

const STEPS = ['Verify Email', 'Business Type', 'Business Profile'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [profile, setProfile] = useState({
    business_name: '', owner_name: '', phone: '', address: '',
    city: 'Bengaluru', state: 'Karnataka', gstin: '',
  });
  const navigate = useNavigate();

  const progress = ((step) / STEPS.length) * 100;

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await signInWithOtp(email);
      setOtpSent(true);
      toast.success('OTP sent to ' + email);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    try {
      await verifyOtp(email, token);
      toast.success('Email verified!');
      setStep(1);
    } catch (err) {
      toast.error('Invalid OTP — ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (value, idx) => {
    const next = [...otp];
    next[idx] = value.slice(-1);
    setOtp(next);
    if (value && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleFinish = async () => {
    if (!profile.business_name || !profile.owner_name || !profile.phone || !profile.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const { getUser } = await import('../services/supabase');
      const user = await getUser();
      await createBusiness({ ...profile, business_type: selectedType, owner_id: user?.id, email });
      toast.success('Business set up!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-navy p-6 pb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">ComplianceAI</span>
          </div>
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-blue-300 mb-2 font-medium">
              <span>{STEPS[step]}</span>
              <span>Step {step + 1} of {STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-400 rounded-full"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* STEP 0 — Email OTP */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Protect your business<br />in 2 minutes</h2>
                <p className="text-gray-500 text-sm mb-8">Enter your work email to get started</p>

                <div className="space-y-4">
                  <div>
                    <label className="section-label mb-1.5 block">Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="input"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>

                  {!otpSent ? (
                    <button onClick={handleSendOtp} disabled={!email || loading} className="btn-primary w-full">
                      {loading ? 'Sending...' : 'Send OTP →'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">Enter the 6-digit code sent to <strong>{email}</strong></p>
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpInput(e.target.value, i)}
                            onKeyDown={(e) => e.key === 'Backspace' && !digit && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()}
                            className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        ))}
                      </div>
                      <button onClick={handleVerifyOtp} disabled={otp.join('').length < 6 || loading} className="btn-primary w-full">
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button onClick={handleSendOtp} className="w-full text-sm text-blue-600 hover:underline">Resend OTP</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 1 — Business Type */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-black text-gray-900 mb-2">What type of business do you run?</h2>
                <p className="text-gray-500 text-sm mb-6">We'll recommend the right licenses for you</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {BUSINESS_TYPES.map((type) => {
                    const Icon = Icons[type.icon] || Icons.Briefcase;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 hover:border-blue-200 text-gray-700'
                        }`}
                      >
                        <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="text-sm font-semibold">{type.label}</span>
                        {isSelected && <Check size={14} className="ml-auto text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setStep(2)} disabled={!selectedType} className="btn-primary w-full">
                  Next <ArrowRight size={16} className="inline ml-1" />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Business Profile */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Business details</h2>
                <p className="text-gray-500 text-sm mb-6">We'll use this to pre-fill renewal forms</p>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {[
                    { key: 'business_name', label: 'Business Name *', placeholder: 'Spice Garden Restaurant' },
                    { key: 'owner_name', label: 'Owner Name *', placeholder: 'Rajesh Kumar' },
                    { key: 'phone', label: 'Phone *', placeholder: '+91 98765 43210', type: 'tel' },
                    { key: 'address', label: 'Business Address *', placeholder: '12, Indiranagar 100 Feet Road' },
                    { key: 'city', label: 'City', placeholder: 'Bengaluru' },
                    { key: 'state', label: 'State', placeholder: 'Karnataka' },
                    { key: 'gstin', label: 'GSTIN (optional)', placeholder: '29AABCS1429B1Z1' },
                  ].map(({ key, label, placeholder, type = 'text' }) => (
                    <div key={key}>
                      <label className="section-label mb-1 block">{label}</label>
                      <input
                        type={type}
                        value={profile[key]}
                        onChange={(e) => setProfile(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Setting up...' : 'Complete Setup 🎉'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
