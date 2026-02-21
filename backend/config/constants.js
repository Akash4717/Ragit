// ─── Groq Models ──────────────────────────────────────────────
// ─── Groq Models ──────────────────────────────────────────────
export const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";   // Updated model
export const GROQ_TRANSCRIPTION_MODEL = "whisper-large-v3"; // Stays same

// ─── RAG Settings ─────────────────────────────────────────────
export const CHUNK_SIZE = 500;   // characters per chunk
export const CHUNK_OVERLAP = 50; // overlap between chunks
export const TOP_K_CHUNKS = 5;   // how many chunks to retrieve per query

// ─── Supported Languages (Lingo.dev) ──────────────────────────
export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
];