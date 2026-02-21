import { LingoDotDevEngine } from "lingo.dev/sdk";
import dotenv from "dotenv";
dotenv.config();

const lingo = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY,
});

// Simple language detector fallback using common word patterns
const detectLanguageFallback = (text) => {
  const sample = text.slice(0, 100).toLowerCase();
  if (/[\u0900-\u097F]/.test(sample)) return "hi"; // Hindi
  if (/[\u4E00-\u9FFF]/.test(sample)) return "zh"; // Chinese
  if (/[\u0600-\u06FF]/.test(sample)) return "ar"; // Arabic
  if (/[\u0400-\u04FF]/.test(sample)) return "ru"; // Russian
  if (/[\u3040-\u30FF]/.test(sample)) return "ja"; // Japanese
  return "en"; // default English
};

export const detectLanguage = async (text) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const detected = await Promise.race([
      lingo.recognizeLocale(text),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Lingo timeout")), 5000)
      ),
    ]);

    clearTimeout(timeout);
    console.log(`🌐 Detected language: ${detected}`);
    return detected || "en";
  } catch (error) {
    console.warn("⚠️ Lingo detection failed, using fallback:", error.message);
    return detectLanguageFallback(text);
  }
};

export const translateToEnglish = async (text, sourceLocale) => {
  try {
    if (sourceLocale === "en") return text;

    const translated = await Promise.race([
      lingo.localizeText(text, { sourceLocale, targetLocale: "en" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Lingo timeout")), 8000)
      ),
    ]);

    console.log(`✅ Translated to English`);
    return translated;
  } catch (error) {
    console.warn("⚠️ Lingo translation failed, using original:", error.message);
    return text; // fallback to original
  }
};

export const translateFromEnglish = async (text, targetLocale) => {
  try {
    if (targetLocale === "en") return text;

    const translated = await Promise.race([
      lingo.localizeText(text, { sourceLocale: "en", targetLocale }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Lingo timeout")), 8000)
      ),
    ]);

    console.log(`✅ Translated to ${targetLocale}`);
    return translated;
  } catch (error) {
    console.warn("⚠️ Lingo translation failed, returning English:", error.message);
    return text; // fallback to English answer
  }
};

export const prepareQuestion = async (question) => {
  const detectedLocale = await detectLanguage(question);
  const translatedQuestion = await translateToEnglish(question, detectedLocale);
  return { translatedQuestion, detectedLocale };
};
