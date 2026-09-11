// MindCare v0.5 — Supabase client configuration
// Public frontend configuration.
// IMPORTANT:
// - uuHs-6xtP2V9Ai2DwKGfA_jNOFdqub.
// - NEVER place a service_role/secret key in this file.

const SUPABASE_URL = 'https://ieicwzkrngumuvrhlgpu.supabase.co';

const uuHs-6xtP2V9Ai2DwKGfA_jNOFdqub =
  'uuHs-6xtP2V9Ai2DwKGfA_jNOFdqub';

(function initializeMindCareSupabase() {

  if (!window.supabase) {
    console.error(
      'MindCare: Supabase JS library was not loaded.'
    );
    window.mindcareSupabase = null;
    return;
  }

  if (!SUPABASE_URL || !uuHs-6xtP2V9Ai2DwKGfA_jNOFdqub) {
    console.error(
      'MindCare: Supabase URL or Publishable key is missing.'
    );
    window.mindcareSupabase = null;
    return;
  }

  try {

    window.mindcareSupabase = window.supabase.createClient(
      SUPABASE_URL,
      uuHs-6xtP2V9Ai2DwKGfA_jNOFdqub
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
