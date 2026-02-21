import supabase from "../config/supabase.js";

// Validates API key sent by the ragit-widget npm package
// Every chat request from the widget must include apiKey + productId
const apiKeyMiddleware = async (req, res, next) => {
  const { apiKey, productId } = req.body;

  if (!apiKey || !productId) {
    return res.status(400).json({ error: "apiKey and productId are required" });
  }

  // Check if a product exists with this apiKey + productId combination
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, language")
    .eq("id", productId)
    .eq("api_key", apiKey)
    .single();

  if (error || !product) {
    return res.status(403).json({ error: "Invalid apiKey or productId" });
  }

  req.product = product; // attach product to request object
  next();
};

export default apiKeyMiddleware;