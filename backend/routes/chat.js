import express from "express";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware.js";
import { retrieveRelevantChunks } from "../services/ragService.js";
import { generateAnswer } from "../services/groqService.js";
import { prepareQuestion, translateFromEnglish } from "../services/lingoService.js";

const router = express.Router();

/**
 * POST /api/chat
 * Main chat endpoint called by the ragit-widget npm package
 */
router.post("/", apiKeyMiddleware, async (req, res) => {
  const { message } = req.body;
  const product = req.product;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    console.log(`💬 New question for product "${product.name}": ${message}`);

    const { translatedQuestion, detectedLocale } = await prepareQuestion(message);

    console.log(`🌐 Detected locale: ${detectedLocale}`);
    console.log(`📝 Translated question: ${translatedQuestion}`);

    const relevantChunks = await retrieveRelevantChunks(
      translatedQuestion,
      product.id
    );

    if (relevantChunks.length === 0) {
      const noDataMessage =
        "No knowledge base found for this product. Please ask your team lead to upload KT materials.";

      const localizedNoData = await translateFromEnglish(
        noDataMessage,
        detectedLocale
      );

      return res.status(200).json({
        answer: localizedNoData,
        detectedLocale,
        chunksUsed: 0,
      });
    }

    const englishAnswer = await generateAnswer(
      translatedQuestion,
      relevantChunks,
      product.name
    );

    const localizedAnswer = await translateFromEnglish(
      englishAnswer,
      detectedLocale
    );

    console.log(`✅ Answer generated and localized to ${detectedLocale}`);

    res.status(200).json({
      answer: localizedAnswer,
      detectedLocale,
      chunksUsed: relevantChunks.length,
    });

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({
      error: "Failed to generate answer. Please try again.",
    });
  }
});

/**
 * POST /api/chat/test
 * Test endpoint for developers from the dashboard
 * Now respects targetLocale from the language dropdown
 */
router.post("/test", async (req, res) => {
  const { productId, message, targetLocale } = req.body;

  if (!productId || !message) {
    return res.status(400).json({ error: "productId and message are required" });
  }

  try {
    const { translatedQuestion, detectedLocale } = await prepareQuestion(message);

    const relevantChunks = await retrieveRelevantChunks(
      translatedQuestion,
      productId
    );

    if (relevantChunks.length === 0) {
      return res.status(200).json({
        answer: "No KT materials found. Please upload resources first.",
        detectedLocale,
        chunksUsed: 0,
      });
    }

    const englishAnswer = await generateAnswer(
      translatedQuestion,
      relevantChunks,
      "Test Product"
    );

    // ✅ Use targetLocale from dropdown if provided, else use detected locale
    const finalLocale = targetLocale || detectedLocale;
    const localizedAnswer = await translateFromEnglish(
      englishAnswer,
      finalLocale
    );

    console.log(`✅ Answer localized to ${finalLocale}`);

    res.status(200).json({
      answer: localizedAnswer,
      detectedLocale: finalLocale,
      chunksUsed: relevantChunks.length,
    });

  } catch (error) {
    console.error("Chat test error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/translate-messages
 * Translates all existing chat messages when user switches language
 * Called by the language dropdown in ChatPreview
 */
router.post("/translate-messages", async (req, res) => {
  const { messages, targetLocale } = req.body;

  if (!messages || !targetLocale) {
    return res.status(400).json({ error: "messages and targetLocale are required" });
  }

  try {
    console.log(`🌐 Translating ${messages.length} messages to ${targetLocale}`);

    const translatedMessages = await Promise.all(
      messages.map((msg) => translateFromEnglish(msg, targetLocale))
    );

    console.log(`✅ All messages translated to ${targetLocale}`);

    res.status(200).json({ translatedMessages });
  } catch (error) {
    console.error("Translate messages error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;