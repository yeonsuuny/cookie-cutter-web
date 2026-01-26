// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://laopkfujploxewbbuimh.supabase.co"; // 본인 프로젝트 URL
const supabaseAnonKey = "sb_publishable_oo6uBhyxmwzIPNdqvAqpPQ_6l11q9UM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);