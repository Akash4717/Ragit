import Groq from "groq-sdk";
import dotenv from "dotenv";
import { GROQ_CHAT_MODEL, GROQ_TRANSCRIPTION_MODEL } from "../config/constants.js";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transcribes a KT video/audio file using Groq Whisper.
 * Called after a developer uploads a video to Supabase Storage.
 *
 * @param {Buffer} fileBuffer - the audio/video file buffer
 * @param {string} fileName - original file name (used to detect format)
 * @returns {string} - full transcript text
 */
export const transcribeAudio = async (fileBuffer, fileName) => {
  try {
    // Groq expects a File-like object
    const file = new File([fileBuffer], fileName, { type: "audio/mpeg" });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: GROQ_TRANSCRIPTION_MODEL,
      response_format: "text", // returns plain string
      language: "en",          // transcribe in English for RAG consistency
    });

    return transcription;
  } catch (error) {
    console.error("Groq transcription error:", error);
    throw new Error("Failed to transcribe audio: " + error.message);
  }
};

/**
 * Generates an answer to a fresher's question using retrieved chunks.
 * This is the final step in the RAG pipeline.
 *
 * @param {string} question - fresher's question (already translated to English)
 * @param {string[]} contextChunks - relevant chunks retrieved from Supabase
 * @param {string} productName - name of the product/company chatbot
 * @returns {string} - AI generated answer
 */
export const generateAnswer = async (question, contextChunks, productName) => {
  try {
    const context = contextChunks.join("\n\n---\n\n");

    const systemPrompt = `
You are an intelligent onboarding assistant for "${productName}".
Your job is to help new team members (freshers) understand the product
by answering their questions based on the KT (Knowledge Transfer) materials provided.

Rules:
- Only answer based on the context provided below.
- If the answer is not in the context, say: "This topic wasn't covered in the KT materials. Please ask your team lead."
- Keep answers clear, friendly, and beginner-friendly.
- Use simple language since you are helping freshers understand complex products.
- If relevant, break your answer into steps or bullet points for clarity.

Context from KT materials:
${context}
    `.trim();

    const response = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.4, // lower = more factual, less creative
      max_tokens: 1024,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq answer generation error:", error);
    throw new Error("Failed to generate answer: " + error.message);
  }
};