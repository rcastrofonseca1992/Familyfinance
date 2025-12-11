import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { hashedStorageKey } from '../utils/security/storage';

const envProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? projectId;
const envAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY ?? publicAnonKey;

if (!envProjectId || !envAnonKey) {
  throw new Error('Supabase credentials are missing. Please set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_PUBLIC_ANON_KEY.');
}

const supabaseUrl = `https://${envProjectId}.supabase.co`;
const storageKey = hashedStorageKey('sb-access-token');

export const supabase = createClient(supabaseUrl, envAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey,
  },
});
