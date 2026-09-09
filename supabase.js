// MindCare v0.4 — Supabase client configuration
// IMPORTANT: use only the Publishable/anon key in this public frontend.
// NEVER place a service_role/secret key here.

const SUPABASE_URL = 'https://ieicwzkrngumuvrhlgpu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWN3emtybmd1bXVydmhsZ3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MjQ0MTUsImV4cCI6MjEwNDUwMDQxNX0.kOgWHOaaiIZyga6Cm9EpcUaI1gQnuZ3mhIedQW2FAgo';

if (!window.supabase) {
  console.error('Supabase JS library was not loaded.');
} else {
  window.mindcareSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}
