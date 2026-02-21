import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new developer account
 * Body: { email, password, fullName }
 */
router.post("/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "email, password and fullName are required" });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // stored in auth.users metadata
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: "Account created! Please verify your email.",
    user: data.user,
  });
});

/**
 * POST /api/auth/login
 * Login with email + password
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.status(200).json({
    message: "Login successful",
    user: data.user,
    session: data.session, // contains access_token frontend will store
  });
});

/**
 * POST /api/auth/logout
 * Logout current session
 */
router.post("/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * GET /api/auth/me
 * Get current logged in user info
 * Header: Authorization: Bearer <token>
 */
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.status(200).json({ user });
});

export default router;