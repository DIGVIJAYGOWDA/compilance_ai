import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, ArrowLeft, Check, Loader2,
  UtensilsCrossed, Scissors, ShoppingBag, Stethoscope,
  HardHat, GraduationCap, Factory, Briefcase, Clock, Lock, Zap, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, signInWithOtp, verifyOtp, createBusiness, getBusiness } from '../services/supabase';
import { BUSINESS_TYPES } from '../utils/licenseTypes';

const ICON_MAP = { UtensilsCrossed, Scissors, ShoppingBag, Stethoscope, HardHat, GraduationCap, Factory, Briefcase };
const STEPS = ['Verify Email', 'Business Type', 'Business Profile'];

const field = (label, key, type = 'text', required = false) => ({ label, key, type, required });
const PROFILE_FIELDS = [
  field('Business Name', 'business_name', 'text', true),
  field('Owner Name', 'owner_name', 'text', true),
  field('Phone Number', 'phone', 'tel', true),
  field('Business Address', 'address', 'text', true),
  field('City', 'city'),
  field('State', 'state'),
  field('GSTIN (optional)', 'gstin'),
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddMode = searchParams.get('mode') === 'add-business';
  // In add-business mode, skip email verification — user is already logged in
  const [step, setStep] = useState(isAddMode ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [profile, setProfile] = useState({ city: 'Bengaluru', state: 'Karnataka' });

  // Step 1 — Auth Flow
  const handleEmailSubmit = async () => {
    if (!email) { toast.error('Enter your email'); return; }
    
    // Automatically check if this device remembers the user has a PIN
    if (localStorage.getItem(`has_pin_${email.toLowerCase()}`)) {
      setUsePin(true);
      return;
    }
    await sendOtp();
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      await signInWithOtp(email);
      setOtpSent(true);
      setUsePin(false);
      toast.success('OTP sent to ' + email);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const verifyPinLogin = async () => {
    if (pin.length !== 4) { toast.error('Enter your 4-digit PIN'); return; }
    setLoading(true);
    try {
      // Must match the padding used when PIN was set in Settings
      const paddedPin = `${pin}AI`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: paddedPin });
      if (error) throw error;
      
      // Check if user already has a business profile
      const existingBiz = await getBusiness(data.user.id);
      if (existingBiz) {
        toast.success('Welcome back!');
        window.location.href = '/businesses';
      } else {
        setStep(1); // New user - go through setup
      }
    } catch (err) { 
      toast.error('Incorrect PIN. Try signing in with OTP.'); 
    } finally { setLoading(false); }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val;
    setOtp(next);
    if (val && idx < 7) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const verifyOtpCode = async () => {
    const code = otp.join('');
    if (code.length < 8) { toast.error('Enter the complete OTP code'); return; }
    setLoading(true);
    try {
      await verifyOtp(email, code);
      
      // Check if user already exists in database
      const { data: { user } } = await supabase.auth.getUser();
      const existingBiz = await getBusiness(user.id);
      
      if (existingBiz) {
        toast.success('Welcome back!');
        window.location.href = '/dashboard';
      } else {
        setStep(1);
      }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // Step 3 — Save profile
  const completeSetup = async () => {
    if (!profile.business_name || !profile.owner_name || !profile.phone) {
      toast.error('Please fill required fields'); return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await createBusiness({ ...profile, business_type: businessType, owner_id: user.id, email: user.email, compliance_score: 100 });
      toast.success(isAddMode ? '🎉 New business added!' : '🎉 Welcome to ComplianceAI!');
      window.location.href = '/businesses';
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex overflow-hidden min-h-[650px] border border-gray-100">
        
        {/* Left Side - Marketing Panel */}
        <div className="hidden lg:flex w-[45%] relative p-12 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#eff4fc] to-[#e4eef9]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-blue-600 rounded-md p-1.5 shadow-sm">
                <Shield className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <span className="font-[800] text-xl text-gray-900 tracking-tight">ComplianceAI</span>
            </div>
            
            <h1 className="text-[40px] font-bold text-gray-900 leading-[1.1] mb-4 tracking-tight">
              Protect your<br />business<br /><span className="text-blue-600">in 2 minutes</span>
            </h1>
            <p className="text-gray-500 text-[15px] mb-12 max-w-[240px]">
              AI-powered compliance made simple, fast, and secure.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Shield className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-[14px]">Smart Compliance</div>
                  <div className="text-gray-500 text-[13px]">Stay ahead with AI-driven insights</div>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-[14px]">Save Time</div>
                  <div className="text-gray-500 text-[13px]">Automate and simplify your workflow</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Lock className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-[14px]">Enterprise Security</div>
                  <div className="text-gray-500 text-[13px]">Your data is always protected</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Bottom Graphic */}
          <div className="absolute -bottom-24 -left-12 z-0 opacity-40">
            <div className="w-64 h-64 rounded-full border-[20px] border-blue-100/50 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-[15px] border-blue-200/50 flex items-center justify-center">
                 <Shield size={80} className="text-blue-300/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Container */}
        <div className="flex-1 bg-white p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center relative">
          
          <div className="w-full max-w-[420px] relative z-10">
            {/* Header Area */}
            <div className="text-center mb-10">
              <h2 className="text-[24px] font-bold text-gray-900 mb-1">Welcome to ComplianceAI</h2>
              <p className="text-[13px] text-gray-500 mb-10">Let's get your business protected</p>
              
              {/* Stepper */}
              <div className="flex items-center justify-center gap-2 mb-10">
                <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${step >= 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                <div className={`h-[2px] w-12 transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
                <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                <div className={`h-[2px] w-12 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
                <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
              </div>

              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">
                Step {step + 1} of 3
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-2">
                {step === 0 ? 'Verify your email' : step === 1 ? 'Business Type' : 'Business Profile'}
              </h3>
              <p className="text-[14px] text-gray-500">
                {step === 0 ? 'Enter your business email to get started' : step === 1 ? "We'll recommend the right licenses" : "Basic details for automated forms"}
              </p>
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {/* Step 1 — Email OTP */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  
                  {!otpSent && !usePin && (
                    <>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="email" placeholder="you@business.com" value={email}
                          onChange={e => setEmail(e.target.value)} 
                          className="w-full border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" 
                          disabled={loading} />
                      </div>
                      
                      <button onClick={handleEmailSubmit} disabled={loading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                        {loading ? 'Processing…' : 'Continue'} {!loading && <ArrowRight size={18} />}
                      </button>

                      <div className="flex items-center gap-4 py-2">
                        <div className="h-[1px] flex-1 bg-gray-100"></div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
                        <div className="h-[1px] flex-1 bg-gray-100"></div>
                      </div>

                      <button onClick={() => setUsePin(true)} className="text-[14px] font-medium text-gray-500 w-full text-center hover:text-blue-600 transition-colors">
                        Already have a PIN? <span className="text-blue-600">Sign in here</span>
                      </button>
                    </>
                  )}

                  {usePin && (
                    <div className="space-y-5">
                      <div>
                        <input type="password" maxLength={4} value={pin}
                          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center text-4xl tracking-[0.5em] font-bold py-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all" 
                          autoFocus />
                      </div>
                      <button onClick={verifyPinLogin} disabled={loading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        Sign In
                      </button>
                      <button onClick={sendOtp} disabled={loading} className="text-[14px] text-blue-600 font-medium w-full text-center hover:underline">
                        Forgot PIN? Sign in with OTP
                      </button>
                      <button onClick={() => setUsePin(false)} className="text-[13px] text-gray-400 w-full text-center hover:text-gray-600">
                        ← Back to email
                      </button>
                    </div>
                  )}

                  {otpSent && !usePin && (
                    <div className="space-y-5">
                      <div className="flex gap-2 justify-center">
                        {otp.map((v, i) => (
                          <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                            value={v} onChange={e => handleOtpChange(i, e.target.value)}
                            className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all" />
                        ))}
                      </div>
                      <button onClick={verifyOtpCode} disabled={loading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        Verify & Continue
                      </button>
                      <button onClick={() => setOtpSent(false)} className="text-[13px] text-gray-400 w-full text-center hover:text-gray-600">
                        ← Change email
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2 — Business Type */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {BUSINESS_TYPES.map((bt) => {
                      const Icon = ICON_MAP[bt.icon] || Briefcase;
                      const selected = businessType === bt.id;
                      return (
                        <button key={bt.id} onClick={() => setBusinessType(bt.id)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${selected ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <Icon size={24} className={selected ? 'text-blue-600' : 'text-gray-400'} />
                          <span className={`text-[13px] font-bold ${selected ? 'text-blue-800' : 'text-gray-600'}`}>{bt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => businessType ? setStep(2) : toast.error('Select a business type')} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors">
                    Continue <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Step 3 — Profile */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {PROFILE_FIELDS.map(({ label, key, type, required }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}{required && ' *'}</label>
                      <input type={type} value={profile[key] || ''} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} 
                        className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[14px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" 
                        placeholder={label} />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors flex justify-center items-center gap-2">
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button onClick={completeSetup} disabled={loading} className="flex-[2] bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      {loading ? 'Setting up…' : 'Complete Setup'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust badges */}
          <div className="hidden md:flex absolute bottom-8 w-full justify-center gap-6 text-[12px] text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><Lock size={14} className="text-blue-600"/> Secure & Private</span>
            <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-600"/> Compliance Ready</span>
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-blue-600"/> Setup in 2 Minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
