import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Verifies Supabase JWT token sent by the dashboard frontend
// Attach this to any route that requires a logged-in dashboard user
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  // Create a user-scoped client to verify the token
  const supabaseUser = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabaseUser.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user; // attach user to request object
  next();
};

export default authMiddleware;