import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfdtppipqqoqknoyehss.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VFnTnEC_xEJA7_IZUy61iA_y6U0IdTj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
