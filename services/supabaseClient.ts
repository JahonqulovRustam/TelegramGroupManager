
import { createClient } from '@supabase/supabase-js';

// Siz taqdim etgan Supabase ulanish ma'lumotlari
const supabaseUrl = 'https://tgepmjvyvpudwrtmhytu.supabase.co';
const supabaseAnonKey = 'sb_publishable_v4-S7oO839lo-T_LjiPZ_Q_kBfyk_-z';

// Klientni yaratamiz
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.info("✅ Supabase muvaffaqiyatli ulandi.");
