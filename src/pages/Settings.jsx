import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Moon, Sun, Globe, Bell, LogOut, Zap, Save, Phone } from 'lucide-react';
import i18n from '../i18n';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../hooks/useAuth';
import { supabase, getBusiness, updateBusiness, signOut } from '../services/supabase';
import { sendWhatsAppReminder } from '../services/whatsappService';
import { useNavigate } from 'react-router-dom';

const REMINDER_OPTIONS = [
  { label: '60 days before', value: 60 },
  { label: '30 days before', value: 30 },
  { label: '7 days before', value: 7 },
  { label: '1 day before', value: 1 },
];

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="section-title border-b border-gray-50 pb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { isDemo, demoBusiness, enterDemo, exitDemo } = useDemo();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [lang, setLang] = useState(i18n.language);
  const [emailReminders, setEmailReminders] = useState(true);
  const [whatsappReminders, setWhatsappReminders] = useState(false);
  const [reminderDays, setReminderDays] = useState([60, 30, 7]);
  const [profile, setProfile] = useState({ business_name: '', owner_name: '', phone: '', address: '', city: 'Bengaluru', state: 'Karnataka', gstin: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [bizId, setBizId] = useState(null);
  
  // PIN setup state
  const [pin, setPin] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);

  useEffect(() => {
    if (isDemo) { setProfile({ ...demoBusiness, email: demoBusiness?.email || '' }); return; }
    if (user) {
      getBusiness(user.id).then(biz => {
        if (biz) {
          setProfile({ ...biz, email: user.email || '' });
          setBizId(biz.id);
          // Load saved reminder preferences from DB
          if (biz.email_reminders !== undefined) setEmailReminders(biz.email_reminders);
          if (biz.whatsapp_reminders !== undefined) setWhatsappReminders(biz.whatsapp_reminders);
          if (biz.reminder_days?.length) setReminderDays(biz.reminder_days);
        }
      }).catch(() => {});
    }
  }, [user, isDemo]);

  const toggleDark = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
  };

  const changeLanguage = (lng) => {
    setLang(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    toast.success(lng === 'kn' ? 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' : 'Switched to English');
  };

  const handleSave = async () => {
    if (isDemo) { toast.success(t('settings.saved')); return; }
    setSaving(true);
    try {
      await updateBusiness(bizId, {
        business_name: profile.business_name, owner_name: profile.owner_name,
        phone: profile.phone, address: profile.address, city: profile.city,
        state: profile.state, gstin: profile.gstin,
        // Save reminder preferences to DB
        email_reminders: emailReminders,
        whatsapp_reminders: whatsappReminders,
        reminder_days: reminderDays,
      });
      toast.success('✅ Profile & reminder settings saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => {
    if (isDemo) { exitDemo(); navigate('/'); return; }
    signOut().catch(console.error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (isDemo) { toast.error('Cannot set PIN in demo mode'); return; }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return toast.error('PIN must be exactly 4 digits');
    }
    setIsPinLoading(true);
    try {
      // Pad to 6 chars (Supabase min password length) — user only ever sees 4 digits
      const paddedPin = `${pin}AI`;
      const { error } = await supabase.auth.updateUser({ password: paddedPin });
      if (error) throw error;
      toast.success('✅ PIN enabled! Use it next time you sign in.');
      localStorage.setItem(`has_pin_${user.email.toLowerCase()}`, 'true');
      setPin('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPinLoading(false);
    }
  };

  const ProfileField = ({ label, keyName, type = 'text', readOnly = false }) => (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={profile[keyName] || ''} readOnly={readOnly}
        onChange={e => setProfile(p => ({ ...p, [keyName]: e.target.value }))}
        className={`input ${readOnly ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-title">{t('settings.title')}</motion.h1>

      {/* Business Profile */}
      <Section title={t('settings.business_profile')}>
        <ProfileField label="Business Name" keyName="business_name" />
        <ProfileField label="Owner Name" keyName="owner_name" />
        <ProfileField label="Phone" keyName="phone" type="tel" />
        <ProfileField label="Address" keyName="address" />
        <div className="grid grid-cols-2 gap-4">
          <ProfileField label="City" keyName="city" />
          <ProfileField label="State" keyName="state" />
        </div>
        <ProfileField label="GSTIN" keyName="gstin" />
        <ProfileField label="Email" keyName="email" type="email" readOnly />
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Saving…' : t('settings.save_changes')}
        </button>
      </Section>

      {/* Notifications */}
      <Section title={t('settings.notifications')}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-800">{t('settings.email_reminders')}</div>
            <div className="text-xs text-gray-400 mt-0.5">Get reminders before license expiry</div>
          </div>
          <button onClick={() => setEmailReminders(!emailReminders)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${emailReminders ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailReminders ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {emailReminders && (
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t('settings.reminder_timing')}</div>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map(({ label, value }) => (
                <button key={value}
                  onClick={() => setReminderDays(prev => prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value])}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border-2 ${reminderDays.includes(value) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* WhatsApp Notifications */}
      <Section title="WhatsApp Reminders">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-green-600" />
            <div>
              <div className="text-sm font-semibold text-gray-800">WhatsApp Alerts</div>
              <div className="text-xs text-gray-400 mt-0.5">Receive license reminders on WhatsApp</div>
            </div>
          </div>
          <button onClick={() => setWhatsappReminders(!whatsappReminders)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${whatsappReminders ? 'bg-green-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${whatsappReminders ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {whatsappReminders && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700">
            <strong>Note:</strong> Reminders will be sent to the phone number in your profile above. Make sure it includes country code (e.g. +91).
          </div>
        )}
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Saving…' : 'Save Notification Preferences'}
        </button>
        {whatsappReminders && profile.phone && (
          <button
            onClick={async () => {
              toast.loading('Sending test WhatsApp...');
              const ok = await sendWhatsAppReminder(
                profile.phone,
                profile.owner_name || profile.business_name || 'User',
                'FSSAI Food License (TEST)',
                7,
                '16 May 2026',
                '₹5,000 – ₹25,000'
              );
              toast.dismiss();
              ok ? toast.success('✅ WhatsApp sent! Check your phone.') : toast.error('Failed — make sure you joined the Twilio sandbox.');
            }}
            className="w-full py-2.5 rounded-xl border-2 border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-all"
          >
            📲 Send Test WhatsApp
          </button>
        )}
      </Section>

      {/* Display */}
      <Section title={t('settings.display')}>
        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-gray-700" /> : <Sun size={18} className="text-amber-500" />}
            <div>
              <div className="text-sm font-semibold text-gray-800">{t('settings.dark_mode')}</div>
              <div className="text-xs text-gray-400">{darkMode ? 'Dark theme active' : 'Light theme active'}</div>
            </div>
          </div>
          <button onClick={toggleDark}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {/* Language */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">{t('settings.language')}</span>
          </div>
          <div className="flex gap-2">
            {[{ code: 'en', label: 'English' }, { code: 'kn', label: 'ಕನ್ನಡ' }].map(({ code, label }) => (
              <button key={code} onClick={() => changeLanguage(code)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${lang === code ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Account & Security */}
      <Section title="Security & Account">
        <div className="mb-6 pb-6 border-b border-gray-50">
          <div className="text-sm font-semibold text-gray-800 mb-1">Sign-in PIN</div>
          <p className="text-xs text-gray-500 mb-3">Set a 4-digit PIN to sign in instantly without waiting for an email OTP.</p>
          <form onSubmit={handleSetPin} className="flex gap-3">
            <input 
              type="password" 
              maxLength={4}
              placeholder="Enter 4-digit PIN" 
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="input flex-1 max-w-[200px] text-center tracking-widest font-bold"
            />
            <button type="submit" disabled={isPinLoading || pin.length !== 4} className="btn-primary">
              {isPinLoading ? 'Saving...' : 'Enable PIN'}
            </button>
          </form>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Signed in as <strong>{isDemo ? demoBusiness?.email : user?.email || 'Demo User'}</strong>
        </div>
        <button onClick={handleSignOut} className="btn-danger w-full">
          <LogOut size={16} /> {isDemo ? t('dashboard.exit_demo') : t('nav.sign_out')}
        </button>
      </Section>

      {/* Demo mode */}
      <Section title={t('settings.demo_mode')}>
        <p className="text-sm text-gray-500">Load sample restaurant data to explore all features without signing in.</p>
        <button onClick={() => { enterDemo(); navigate('/dashboard'); toast.success('Demo mode activated!'); }}
          className="btn-secondary w-full">
          <Zap size={16} /> {t('settings.load_demo')}
        </button>
      </Section>
    </div>
  );
}
