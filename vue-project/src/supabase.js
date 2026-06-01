import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxyotgdlkktbqwpkremj.supabase.co'
const supabaseAnonKey = 'sb_publishable__Wh7v9WbfDZymXwdcEnXGA_YyIOFVMa'

export const supabase =
createClient(
  supabaseUrl,
  supabaseAnonKey )