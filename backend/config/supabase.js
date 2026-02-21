import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Admin client — uses service role key, bypasses RLS
// Only use this in backend routes, never expose to frontend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;