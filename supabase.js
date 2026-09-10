// MindCare v0.5 — Supabase client configuration
// Public frontend configuration.
// IMPORTANT:
// - Use ONLY the Supabase Publishable/anon key here.
// - NEVER place a service_role/secret key in this file.

const SUPABASE_URL = 'https://ieicwzkrngumuvrhlgpu.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'YOUR_EXISTING_PUBLISHABLE_OR_ANON_KEY';

(function initializeMindCareSupabase() {

  if (!window.supabase) {
    console.error(
      'MindCare: Supabase JS library was not loaded.'
    );
    window.mindcareSupabase = null;
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error(
      'MindCare: Supabase URL or Publishable key is missing.'
    );
    window.mindcareSupabase = null;
    return;
  }

  try {

    window.mindcareSupabase = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    console.log('MindCare: Supabase client initialized.');

  } catch (error) {

    console.error(
      'MindCare: Failed to initialize Supabase client.',
      error
    );

    window.mindcareSupabase = null;
  }

})();
