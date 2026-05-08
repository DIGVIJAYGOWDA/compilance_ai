import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Auth ─────────────────────────────────────────────────────────────
export async function signInWithOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Business ──────────────────────────────────────────────────────────
export async function createBusiness(data) {
  const { data: result, error } = await supabase.from('businesses').insert([data]).select().single();
  if (error) throw error;
  return result;
}

export async function getBusiness(ownerId) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateBusiness(id, updates) {
  const { data, error } = await supabase.from('businesses').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ── Licenses ──────────────────────────────────────────────────────────
export async function getLicenses(businessId) {
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('business_id', businessId)
    .order('expiry_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createLicense(data) {
  const { data: result, error } = await supabase.from('licenses').insert([data]).select().single();
  if (error) throw error;
  return result;
}

export async function updateLicense(id, updates) {
  const { data, error } = await supabase.from('licenses').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLicense(id) {
  const { error } = await supabase.from('licenses').delete().eq('id', id);
  if (error) throw error;
}

// ── Storage ───────────────────────────────────────────────────────────
export async function uploadDocument(file, businessId, licenseId) {
  const ext = file.name.split('.').pop();
  const path = `${businessId}/${licenseId}.${ext}`;
  const { error } = await supabase.storage.from('license-documents').upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function getDocumentUrl(path) {
  const { data } = supabase.storage.from('license-documents').getPublicUrl(path);
  return data?.publicUrl || null;
}

// ── Reminders ─────────────────────────────────────────────────────────
export async function logReminder(licenseId, stage, channel = 'email') {
  const { error } = await supabase.from('reminders').insert([{
    license_id: licenseId,
    reminder_stage: stage,
    channel,
    status: 'sent',
  }]);
  if (error) throw error;
}

export async function getRemindersSent(licenseId) {
  const { data, error } = await supabase
    .from('reminders')
    .select('reminder_stage')
    .eq('license_id', licenseId);
  if (error) return [];
  return data.map(r => r.reminder_stage);
}
