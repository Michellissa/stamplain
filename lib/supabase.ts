import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zdubxpuyxfltdhikyrxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdWJ4cHV5eGZsdGRoaWt5cnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE2NzAsImV4cCI6MjA3OTUwNzY3MH0.M6yUvE_LqWzhpuTv_qU97NE8T73vnWt1egdxe8wL748';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
