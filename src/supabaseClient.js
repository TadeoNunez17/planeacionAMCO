import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Agrega este console.log para ver si las llaves cargan
console.log("Conectando a:", supabaseUrl); 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)