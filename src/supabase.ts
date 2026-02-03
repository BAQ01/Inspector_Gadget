// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Jouw project gegevens
const SUPABASE_URL = 'https://blqpecudiddxwbidtdjk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscXBlY3VkaWRkeHdiaWR0ZGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzg2MDgsImV4cCI6MjA4NTYxNDYwOH0.91IuuSrl123zurAqueESzQChZZqvXKKamygb_Xdks_g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);