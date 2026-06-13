import { createClient } from '@supabase/supabase-js';

// Mismas envs y fallbacks que el codebase original.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rmvlncyhsfurhmmekguh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bl4MaDWBBafanj59v85gPA_QavvSdch';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
