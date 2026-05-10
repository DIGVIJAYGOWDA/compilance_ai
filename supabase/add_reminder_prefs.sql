-- Run this in Supabase Dashboard → SQL Editor
-- Adds reminder preference columns to the businesses table

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS email_reminders BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_days   INTEGER[] DEFAULT ARRAY[60, 30, 7];
