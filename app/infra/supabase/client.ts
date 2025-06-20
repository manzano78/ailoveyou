import { createClient } from '@supabase/supabase-js';
import invariant from 'tiny-invariant';
import { type Database } from './database.types';

const SUPABASE_URL = 'https://kdfsbgvjledvhhagvwzb.supabase.co';
const { SUPABASE_KEY } = process.env;

invariant(
  SUPABASE_KEY,
  'process.env.SUPABASE_KEY not found. Please provide it!',
);

export const supabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_KEY,
);
