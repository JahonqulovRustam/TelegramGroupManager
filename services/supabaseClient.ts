
import { createClient } from '@supabase/supabase-js';

// Siz taqdim etgan Supabase ulanish ma'lumotlari
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Klientni yaratamiz
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing');
}
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

console.info("✅ Supabase muvaffaqiyatli ulandi.");
