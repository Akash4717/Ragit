import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All product routes require a logged-in developer
router.use(authMiddleware);

/**
 * GET /api/products
 * Get all products/chatbots for the logged-in developer
 */
router.get("/", async (req, res) => {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ products });
});

/**
 * GET /api/products/:id
 * Get a single product with its resources
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      resources (
        id,
        file_name,
        file_type,
        status,
        created_at
      )
    `)
    .eq("id", id)
    .eq("user_id", req.user.id) // ensure ownership
    .single();

  if (error || !product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json({ product });
});

/**
 * POST /api/products
 * Create a new chatbot product
 * Body: { name, description, language }
 */
router.post("/", async (req, res) => {
  const { name, description, language = "en" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Product name is required" });
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      user_id: req.user.id,
      name,
      description,
      language,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({
    message: "Product created successfully",
    product, // includes auto-generated api_key and id
  });
});

/**
 * PATCH /api/products/:id
 * Update product name, description or language
 * Body: { name?, description?, language? }
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, language } = req.body;

  const { data: product, error } = await supabase
    .from("products")
    .update({ name, description, language })
    .eq("id", id)
    .eq("user_id", req.user.id) // ensure ownership
    .select()
    .single();

  if (error || !product) {
    return res.status(404).json({ error: "Product not found or unauthorized" });
  }

  res.status(200).json({
    message: "Product updated successfully",
    product,
  });
});

/**
 * DELETE /api/products/:id
 * Delete a product and all its resources + chunks
 * Supabase cascade handles resources and chunks deletion
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id); // ensure ownership

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Product deleted successfully" });
});

/**
 * POST /api/products/:id/regenerate-key
 * Regenerate API key for a product
 * Useful if a developer's key gets leaked
 */
router.post("/:id/regenerate-key", async (req, res) => {
  const { id } = req.params;

  // Generate new API key
  const newApiKey = "rg_" + crypto.randomUUID().replace(/-/g, "");

  const { data: product, error } = await supabase
    .from("products")
    .update({ api_key: newApiKey })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error || !product) {
    return res.status(404).json({ error: "Product not found or unauthorized" });
  }

  res.status(200).json({
    message: "API key regenerated successfully",
    api_key: product.api_key,
  });
});

export default router;