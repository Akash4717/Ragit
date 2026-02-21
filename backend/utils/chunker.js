import { CHUNK_SIZE, CHUNK_OVERLAP } from "../config/constants.js";

// Cleans text before chunking — removes null bytes and bad characters
// that Postgres cannot store
const cleanText = (text) => {
  return text
    .replace(/\u0000/g, "")         // remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // remove control chars
    .replace(/\s+/g, " ")           // normalize whitespace
    .trim();
};

export const chunkTranscript = (transcript) => {
  const chunks = [];
  const cleaned = cleanText(transcript);
  let start = 0;

  while (start < cleaned.length) {
    const end = start + CHUNK_SIZE;
    const chunk = cleaned.slice(start, end);

    if (chunk.trim().length > 0) {
      chunks.push({
        content: chunk.trim(),
        index: chunks.length,
      });
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
};

export const chunkBySentence = (transcript) => {
  const chunks = [];
  const cleaned = cleanText(transcript);

  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];

  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > CHUNK_SIZE) {
      if (currentChunk.trim().length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunks.length,
        });
      }
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunks.length,
    });
  }

  return chunks;
};