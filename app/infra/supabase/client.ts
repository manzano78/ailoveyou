import { createClient } from '@supabase/supabase-js';
import invariant from 'tiny-invariant';

const SUPABASE_URL = 'https://kdfsbgvjledvhhagvwzb.supabase.co';
const { SUPABASE_KEY } = process.env;

invariant(
  SUPABASE_KEY,
  'process.env.SUPABASE_KEY not found. Please provide it!',
);

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
