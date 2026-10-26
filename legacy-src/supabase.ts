// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Haal de beveiligde sleutels op uit het .env bestand
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);