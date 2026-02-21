import supabase from "../config/supabase.js";
import { chunkBySentence } from "../utils/chunker.js";
import { TOP_K_CHUNKS } from "../config/constants.js";

export const storeChunks = async (transcript, resourceId, productId) => {
  try {
    const chunks = chunkBySentence(transcript);

    if (chunks.length === 0) {
      throw new Error("No chunks generated from transcript");
    }

    const rows = chunks.map((chunk) => ({
      resource_id: resourceId,
      product_id: productId,
      content: chunk.content,
    }));

    const { error } = await supabase.from("chunks").insert(rows);

    if (error) throw error;

    console.log(`✅ Stored ${rows.length} chunks for resource ${resourceId}`);
    return rows.length;
  } catch (error) {
    console.error("Error storing chunks:", error);
    throw new Error("Failed to store chunks: " + error.message);
  }
};

export const retrieveRelevantChunks = async (question, productId) => {
  try {
    console.log(`🔍 Searching chunks for: "${question}" in product ${productId}`);

    // Extract keywords from question for search
    const keywords = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .filter((w) => w.length > 3); // ignore small words

    console.log(`🔑 Keywords:`, keywords);

    // Try keyword search for each word and collect results
    let allChunks = [];

    for (const keyword of keywords.slice(0, 3)) { // top 3 keywords
      const { data, error } = await supabase
        .from("chunks")
        .select("content")
        .eq("product_id", productId)
        .ilike("content", `%${keyword}%`)
        .limit(3);

      if (!error && data) {
        allChunks = [...allChunks, ...data];
      }
    }

    // Deduplicate chunks by content
    const seen = new Set();
    const uniqueChunks = allChunks.filter((chunk) => {
      if (seen.has(chunk.content)) return false;
      seen.add(chunk.content);
      return true;
    });

    console.log(`✅ Found ${uniqueChunks.length} unique chunks`);

    // Fallback: if nothing found, return recent chunks as context
    if (uniqueChunks.length === 0) {
      console.warn("⚠️ No keyword matches, falling back to recent chunks");

      const { data: fallback, error: fallbackError } = await supabase
        .from("chunks")
        .select("content")
        .eq("product_id", productId)
        .limit(TOP_K_CHUNKS);

      if (fallbackError) throw fallbackError;

      console.log(`📦 Fallback returned ${fallback?.length} chunks`);
      return fallback?.map((c) => c.content) || [];
    }

    return uniqueChunks.slice(0, TOP_K_CHUNKS).map((c) => c.content);
  } catch (error) {
    console.error("Error retrieving chunks:", error);
    throw new Error("Failed to retrieve chunks: " + error.message);
  }
};

export const deleteChunksByResource = async (resourceId) => {
  try {
    const { error } = await supabase
      .from("chunks")
      .delete()
      .eq("resource_id", resourceId);

    if (error) throw error;

    console.log(`🗑️ Deleted chunks for resource ${resourceId}`);
  } catch (error) {
    console.error("Error deleting chunks:", error);
    throw new Error("Failed to delete chunks: " + error.message);
  }
};