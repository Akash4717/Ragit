import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { storeChunks } from "../services/ragService.js";

const router = express.Router();

// All transcript routes require a logged-in developer
router.use(authMiddleware);

/**
 * GET /api/transcript/:resourceId
 * Get the full transcript of a KT resource
 * Used in dashboard to show developer what was transcribed
 */
router.get("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;

  try {
    const { data: resource, error } = await supabase
      .from("resources")
      .select(`
        id,
        file_name,
        file_type,
        transcript,
        status,
        created_at,
        product_id
      `)
      .eq("id", resourceId)
      .single();

    if (error || !resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Verify the resource belongs to a product owned by this developer
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", resource.product_id)
      .eq("user_id", req.user.id)
      .single();

    if (productError || !product) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.status(200).json({ resource });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transcript/:resourceId/chunks
 * Get all chunks stored for a resource
 * Useful for debugging — developer can see exactly what the chatbot knows
 */
router.get("/:resourceId/chunks", async (req, res) => {
  const { resourceId } = req.params;

  try {
    const { data: chunks, error } = await supabase
      .from("chunks")
      .select("id, content, created_at")
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      total: chunks.length,
      chunks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/transcript/:resourceId
 * Manually edit a transcript
 * Developer can fix any errors in the auto-generated transcript
 * This re-chunks and re-stores everything for the resource
 * Body: { transcript }
 */
router.patch("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;
  const { transcript } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: "Transcript content is required" });
  }

  try {
    // Verify ownership via product
    const { data: resource, error: resourceError } = await supabase
      .from("resources")
      .select("id, product_id")
      .eq("id", resourceId)
      .single();

    if (resourceError || !resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", resource.product_id)
      .eq("user_id", req.user.id)
      .single();

    if (productError || !product) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update transcript in resource record
    await supabase
      .from("resources")
      .update({ transcript, status: "processing" })
      .eq("id", resourceId);

    // Delete old chunks for this resource
    await supabase
      .from("chunks")
      .delete()
      .eq("resource_id", resourceId);

    // Re-chunk and store with updated transcript
    const chunkCount = await storeChunks(
      transcript,
      resourceId,
      resource.product_id
    );

    // Mark as done
    await supabase
      .from("resources")
      .update({ status: "done" })
      .eq("id", resourceId);

    res.status(200).json({
      message: "Transcript updated and re-processed successfully",
      chunkCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;