import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, CheckCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { extractTextFromImage, preprocessImage } from '../../services/ocrService';
import { extractLicenseFromText } from '../../services/geminiService';
import { getLicenseById, LICENSE_TYPES } from '../../utils/licenseTypes';

const STEPS = { UPLOAD: 'upload', SCANNING: 'scanning', RESULTS: 'results', SUCCESS: 'success' };
const SCAN_MESSAGES = ['Reading document...', 'Extracting fields...', 'Verifying with AI...'];

export default function ScanModal({ isOpen, onClose, onSave, businessId, isDemo }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanMsgIdx, setScanMsgIdx] = useState(0);
  const [extracted, setExtracted] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const dropRef = useRef();

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;
    const { preview: prev } = await preprocessImage(file);
    setPreview(prev);
    setStep(STEPS.SCANNING);
    setProgress(0);
    setScanMsgIdx(0);

    const msgInterval = setInterval(() => {
      setScanMsgIdx((i) => (i + 1) % SCAN_MESSAGES.length);
    }, 1800);

    try {
      // OCR
      const { text, error: ocrErr } = await extractTextFromImage(file, (p) => setProgress(Math.min(p, 60)));
      if (ocrErr) throw new Error(ocrErr);

      setProgress(70);
      setScanMsgIdx(2);

      // Gemini extraction
      const { data, confidence: conf, error: aiErr } = await extractLicenseFromText(text);

      setProgress(100);
      clearInterval(msgInterval);

      if (aiErr || !data) {
        // Fallback to manual entry
        const manualFields = { license_type: '', license_number: '', issuing_authority: '', expiry_date: '', issue_date: '', business_name: '' };
        setFields(manualFields);
        setConfidence(0);
      } else {
        setFields(data);
        setConfidence(conf);
      }
      setExtracted(data);
      setStep(STEPS.RESULTS);
    } catch (err) {
      clearInterval(msgInterval);
      toast.error('Scan failed: ' + err.message);
      setStep(STEPS.UPLOAD);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const licenseData = {
        business_id: businessId,
        license_type: fields.license_type || '',
        license_number: fields.license_number || '',
        issuing_authority: fields.issuing_authority || '',
        expiry_date: fields.expiry_date || null,
        issue_date: fields.issue_date || null,
        confidence_score: confidence,
        status: 'active',
      };
      if (!isDemo && onSave) await onSave(licenseData);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep(STEPS.UPLOAD);
    setPreview(null);
    setExtracted(null);
    setFields({});
    setProgress(0);
    setConfidence(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{t('scan.upload_title')}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
          </div>

          {/* UPLOAD STATE */}
          {step === STEPS.UPLOAD && (
            <div className="p-6">
              <div
                ref={dropRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="text-blue-600" size={28} />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">{t('scan.upload_sub')}</p>
                <p className="text-sm text-gray-400">{t('scan.supported')}</p>
                <input ref={fileRef} type="file" accept="image/*,.pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
              </div>
              <button
                onClick={() => { fileRef.current.setAttribute('capture', 'environment'); fileRef.current?.click(); }}
                className="mt-4 btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Camera size={18} /> {t('scan.take_photo')}
              </button>
            </div>
          )}

          {/* SCANNING STATE */}
          {step === STEPS.SCANNING && (
            <div className="p-6">
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 220 }}>
                {preview && <img src={preview} alt="document" className="w-full h-full object-cover opacity-70" />}
                {/* Scanning laser */}
                <motion.div
                  className="absolute left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.6)]"
                  animate={{ top: ['0%', '95%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-blue-900/20" />
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">{SCAN_MESSAGES[scanMsgIdx]}</span>
                  <span className="font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* RESULTS STATE */}
          {step === STEPS.RESULTS && (
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-48">
                  {preview && <img src={preview} alt="document" className="w-full h-full object-cover" />}
                </div>
                {confidence < 60 && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${confidence < 30 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    <AlertTriangle size={16} />
                    {confidence < 30 ? t('scan.poor_quality') : t('scan.low_confidence')}
                  </div>
                )}
                {confidence >= 60 && (
                  <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                    {t('license.confidence')}: <strong>{confidence}%</strong>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">{t('scan.results_title')}</h3>
                {Object.entries({
                  license_type: 'License Type',
                  license_number: 'License Number',
                  issuing_authority: 'Issuing Authority',
                  business_name: 'Business Name',
                  expiry_date: 'Expiry Date',
                  issue_date: 'Issue Date',
                }).map(([key, label]) => (
                  <div key={key}>
                    <label className="section-label mb-1 block">{label}</label>
                    {key === 'license_type' ? (
                      <select
                        value={fields[key] || ''}
                        onChange={(e) => setFields(f => ({ ...f, [key]: e.target.value }))}
                        className="input"
                      >
                        <option value="">Select type...</option>
                        {LICENSE_TYPES.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                      </select>
                    ) : (
                      <input
                        type={key.includes('date') ? 'date' : 'text'}
                        value={fields[key] || ''}
                        onChange={(e) => setFields(f => ({ ...f, [key]: e.target.value }))}
                        className="input"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {step === STEPS.SUCCESS && (
            <div className="p-12 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="text-green-600" size={40} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('scan.success')}</h3>
              <button onClick={onClose} className="btn-primary mt-6">{t('scan.view_dashboard')}</button>
            </div>
          )}

          {/* Footer actions */}
          {step === STEPS.RESULTS && (
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={reset} className="btn-secondary flex items-center gap-2">
                <RefreshCcw size={16} />{t('scan.retake')}
              </button>
              <button onClick={handleSave} disabled={saving || !fields.expiry_date} className="btn-primary flex-1">
                {saving ? 'Saving...' : t('scan.confirm_save')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
