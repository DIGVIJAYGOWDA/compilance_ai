import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Moon, Sun, Globe, Bell, LogOut, Zap } from 'lucide-react';
import i18n from '../i18n';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../hooks/useAuth';
import { getBusiness, updateBusiness, signOut } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const REMINDER_OPTIONS = [
  { label: '60 days before', value: 60 },
  { label: '30 days before', value: 30 },
  { label: '7 days before', value: 7 },
  { label: '1 day before', value: 1 },
];

export default function Settings() {
  const { t } = useTranslation();
  const { isDemo, demoBusiness, enterDemo, exitDemo } = useDemo();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [lang, setLang] = useState(i18n.language);
  const [emailReminders, setEmailReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState([60, 30, 7]);
  const [profile, setProfile] = useState({ business_name: '', owner_name: '', phone: '', address: '', city: 'Bengaluru', state: 'Karnataka', gstin: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [bizId, setBizId] = useState(null);

  useEffect(() => {
    if (isDemo) {
      setProfile({ ...demoBusiness, email: demoBusiness?.email || '' });
      return;
    }
    if (user) {
      getBusiness(user.id).then(biz => {
        if (biz) { setProfile({ ...biz, email: user.email || '' }); setBizId(biz.id); }
      });
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
      await updateBusiness(bizId, { business_name: profile.business_name, owner_name: profile.owner_name, phone: profile.phone, address: profile.address, city: profile.city, state: profile.state, gstin: profile.gstin });
      toast.success(t('settings.saved'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (isDemo) { exitDemo(); navigate('/'); return; }
    await signOut();
    navigate('/');
  };

  const handleDemo = () => {
    enterDemo();
    navigate('/dashboard');
    toast.success('Demo mode activated!');
  };

  const Section = ({ title, children }) => (
    <div className="card space-y-4">
      <h2 className="section-title border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-title">
        {t('settings.title')}
      </motion.h1>

      {/* Business Profile */}
      <Section title={t('settings.business_profile')}>
        {[
          { key: 'business_name', label: 'Business Name' },
          { key: 'owner_name', label: 'Owner Name' },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'address', label: 'Address' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State' },
          { key: 'gstin', label: 'GSTIN' },
          { key: 'email', label: 'Email', type: 'email', readOnly: true },
        ].map(({ key, label, type = 'text', readOnly }) => (
          <div key={key}>
            <label className="section-label mb-1 block">{label}</label>
            <input
              type={type}
              value={profile[key] || ''}
              onChange={(e) => setProfile(p => ({ ...p, [key]: e.target.value }))}
              readOnly={readOnly}
              className={`input ${readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : t('settings.save_changes')}
        </button>
      </Section>

      {/* Notifications */}
      <Section title={t('settings.notifications')}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-800">{t('settings.email_reminders')}</div>
            <div className="text-xs text-gray-400">Get reminders before license expiry</div>
          </div>
          <button
            onClick={() => setEmailReminders(!emailReminders)}
            className={`w-12 h-6 rounded-full transition-colors relative ${emailReminders ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailReminders ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {emailReminders && (
          <div>
            <div className="section-label mb-2">{t('settings.reminder_timing')}</div>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setReminderDays(prev => prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value])}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                    reminderDays.includes(value) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Display */}
      <Section title={t('settings.display')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-gray-700" /> : <Sun size={18} className="text-amber-500" />}
            <div>
              <div className="text-sm font-semibold text-gray-800">{t('settings.dark_mode')}</div>
              <div className="text-xs text-gray-400">{darkMode ? 'Dark theme active' : 'Light theme active'}</div>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">{t('settings.language')}</span>
          </div>
          <div className="flex gap-2">
            {[{ code: 'en', label: 'English' }, { code: 'kn', label: 'ಕನ್ನಡ' }].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${lang === code ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Account */}
      <Section title={t('settings.account')}>
        <div className="text-sm text-gray-600">
          Signed in as <strong>{isDemo ? demoBusiness?.email : user?.email || 'Demo User'}</strong>
        </div>
        <button onClick={handleSignOut} className="btn-danger w-full flex items-center justify-center gap-2">
          <LogOut size={16} /> {isDemo ? t('dashboard.exit_demo') : t('nav.sign_out')}
        </button>
      </Section>

      {/* Demo Mode */}
      <Section title={t('settings.demo_mode')}>
        <p className="text-sm text-gray-500">Load sample restaurant data to explore all features without signing in.</p>
        <button onClick={handleDemo} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Zap size={16} /> {t('settings.load_demo')}
        </button>
      </Section>
    </div>
  );
}
