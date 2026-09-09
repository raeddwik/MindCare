/* MindCare Supabase configuration - Publishable/anon key only. */
const SUPABASE_URL = 'https://ieicwzkrngumuvrhlgpu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'f78443bf-412c-4c4c-8177-e52606061003';
window.mindcareSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
