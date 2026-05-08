import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, Download, ExternalLink, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateFormPrefill } from '../../services/geminiService';
import { generateRenewalPDF } from '../../services/pdfService';
import { getLicenseById } from '../../utils/licenseTypes';

export default function RenewalForm({ license, business }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});

  const def = getLicenseById(license?.license_type);

  const handlePrefill = async () => {
    setLoading(true);
    try {
      const { data, error } = await generateFormPrefill(business, license?.license_type);
      if (error) throw new Error(error);
      setFormData(data);
      toast.success('Form pre-filled by AI!');
    } catch (err) {
      toast.error('AI unavailable — please enter details manually');
      // Fallback
      setFormData({
        formFields: [
          { fieldName: 'Business Name', fieldValue: business?.business_name || '', editable: false },
          { fieldName: 'Owner Name', fieldValue: business?.owner_name || '', editable: false },
          { fieldName: 'Address', fieldValue: business?.address || '', editable: true },
          { fieldName: 'License Number', fieldValue: license?.license_number || '', editable: true },
          { fieldName: 'GSTIN', fieldValue: business?.gstin || '', editable: true },
        ],
        documentChecklist: def?.documents_required || [],
        renewalInstructions: ['Visit the official portal', 'Fill the online form', 'Upload required documents', 'Pay the renewal fee', 'Download the renewed license'],
        estimatedTime: '5-10 business days',
        estimatedCost: 'Varies by license type',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const url = generateRenewalPDF(business, license?.license_type, formData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${license?.license_type}_renewal_form.pdf`;
    a.click();
    toast.success('PDF downloaded!');
  };

  const toggleDoc = (item) => {
    setCheckedDocs(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-6">
      {/* Document Checklist (always shown) */}
      {def?.documents_required?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Document Checklist</h4>
          <div className="space-y-2">
            {def.documents_required.map((doc, i) => (
              <button
                key={i}
                onClick={() => toggleDoc(doc)}
                className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {checkedDocs[doc]
                  ? <CheckSquare className="text-green-600 flex-shrink-0" size={18} />
                  : <Square className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" size={18} />
                }
                <span className={`text-sm ${checkedDocs[doc] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{doc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pre-fill button */}
      {!formData && (
        <button onClick={handlePrefill} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader size={16} className="animate-spin" /> Pre-filling with AI...</> : '✨ Pre-fill Renewal Form'}
        </button>
      )}

      {/* Form fields */}
      {formData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-gray-800 mb-3">Pre-filled Form</h4>
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            {formData.formFields?.map((field, i) => (
              <div key={i}>
                <label className="section-label mb-1 block">{field.fieldName}</label>
                <input
                  type="text"
                  defaultValue={field.fieldValue}
                  readOnly={!field.editable}
                  className={`input ${!field.editable ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                />
              </div>
            ))}
          </div>

          {formData.renewalInstructions?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Renewal Steps</h4>
              <ol className="space-y-2">
                {formData.renewalInstructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500">Estimated Time</div>
              <div className="text-sm font-bold text-blue-700">{formData.estimatedTime}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500">Estimated Cost</div>
              <div className="text-sm font-bold text-green-700">{formData.estimatedCost}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleDownloadPDF} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Download size={16} /> Download PDF
            </button>
            <a
              href={license?.renewal_portal_url || def?.renewal_portal}
              target="_blank" rel="noreferrer"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} /> Go to Portal
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
