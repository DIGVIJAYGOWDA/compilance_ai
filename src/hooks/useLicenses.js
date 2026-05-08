import { useState, useEffect, useCallback } from 'react';
import { getLicenses, createLicense, updateLicense, deleteLicense } from '../services/supabase';
import { getDaysLeft, getStatusFromDays } from '../utils/formatters';

export function useLicenses(businessId, demoLicenses = null) {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const enrichLicense = (lic) => {
    const daysLeft = getDaysLeft(lic.expiry_date);
    const status = getStatusFromDays(daysLeft);
    return { ...lic, daysLeft, status };
  };

  const fetchLicenses = useCallback(async () => {
    if (demoLicenses) {
      setLicenses(demoLicenses.map(enrichLicense));
      setLoading(false);
      return;
    }
    if (!businessId) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getLicenses(businessId);
      setLicenses(data.map(enrichLicense));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId, demoLicenses]);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const addLicense = async (data) => {
    if (demoLicenses) return; // no writes in demo
    const result = await createLicense(data);
    setLicenses((prev) => [...prev, enrichLicense(result)].sort((a, b) => a.daysLeft - b.daysLeft));
    return result;
  };

  const editLicense = async (id, updates) => {
    if (demoLicenses) return;
    const result = await updateLicense(id, updates);
    setLicenses((prev) => prev.map((l) => l.id === id ? enrichLicense(result) : l));
    return result;
  };

  const removeLicense = async (id) => {
    if (demoLicenses) return;
    await deleteLicense(id);
    setLicenses((prev) => prev.filter((l) => l.id !== id));
  };

  // Sort by urgency (expired first, then fewest days left)
  const sortedByUrgency = [...licenses].sort((a, b) => a.daysLeft - b.daysLeft);

  return { licenses, sortedLicenses: sortedByUrgency, loading, error, addLicense, editLicense, removeLicense, refetch: fetchLicenses };
}
