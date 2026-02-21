import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { transcribeAudio } from "../services/groqService.js";
import { storeChunks } from "../services/ragService.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const storageClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.use(authMiddleware);

router.use((req, res, next) => {
  console.log(`📡 Upload route hit: ${req.method} ${req.path}`);
  next();
});

router.post("/:productId", upload.single("resource"), async (req, res) => {
  const { productId } = req.params;

  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .eq("user_id", req.user.id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    console.log(`📁 Received file: ${file.originalname} (${file.size} bytes)`);

    const fileName = file.originalname;
    const contentType = file.mimetype;
    const fileBuffer = file.buffer;
    const ext = fileName.split(".").pop().toLowerCase();

    const fileType =
      ["mp4", "mp3", "wav", "m4a", "webm"].includes(ext)
        ? "video"
        : ext === "pdf"
        ? "pdf"
        : ext === "docx"
        ? "docx"
        : ["ppt", "pptx"].includes(ext)
        ? "pptx"
        : "text";

    const storagePath = `${req.user.id}/${productId}/${Date.now()}_${fileName}`;

    const { error: storageError } = await storageClient.storage
      .from("ragit-resources")
      .upload(storagePath, fileBuffer, { contentType, upsert: false });

    if (storageError) {
      console.error("Storage error:", storageError);
      return res.status(500).json({ error: "Storage upload failed: " + storageError.message });
    }

    console.log(`✅ File stored at: ${storagePath}`);

    const { data: resource, error: resourceError } = await supabase
      .from("resources")
      .insert({
        product_id: productId,
        file_name: fileName,
        file_type: fileType,
        storage_path: storagePath,
        status: "processing",
      })
      .select()
      .single();

    if (resourceError) {
      console.error("Resource insert error:", resourceError);
      return res.status(500).json({ error: "Failed to create resource record" });
    }

    console.log(`✅ Resource record created: ${resource.id}`);

    res.status(202).json({
      message: "File uploaded! Processing in background.",
      resourceId: resource.id,
      status: "processing",
    });

    processResource(fileBuffer, fileName, fileType, resource.id, productId).catch(
      async (err) => {
        console.error("❌ Background processing failed:", err);
        await supabase
          .from("resources")
          .update({ status: "failed" })
          .eq("id", resource.id);
      }
    );

  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: "Upload failed: " + error.message });
  }
});

const processResource = async (fileBuffer, fileName, fileType, resourceId, productId) => {
  console.log("🔥 processResource called!", { fileName, fileType, resourceId });

  try {
    let transcript = "";
    const ext = fileName.split(".").pop().toLowerCase();

    if (ext === "txt") {
      // ── Plain text ─────────────────────────────────────────
      console.log(`📄 Reading text file: ${fileName}`);
      transcript = fileBuffer.toString("utf-8");
      console.log(`✅ Text read. Length: ${transcript.length} chars`);

    } else if (["mp4", "mp3", "wav", "m4a", "webm"].includes(ext)) {
      // ── Audio/Video → Groq Whisper ─────────────────────────
      console.log(`🎙️ Transcribing audio/video: ${fileName}`);
      transcript = await transcribeAudio(fileBuffer, fileName);
      console.log(`✅ Transcription done. Length: ${transcript.length} chars`);

    } else if (ext === "docx") {
      // ── DOCX → mammoth ─────────────────────────────────────
      console.log(`📝 Parsing DOCX: ${fileName}`);
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      transcript = result.value;
      console.log(`✅ DOCX parsed. Length: ${transcript.length} chars`);

    } else if (["ppt", "pptx"].includes(ext)) {
      // ── PPT/PPTX → officeparser ────────────────────────────
      console.log(`📊 Parsing PPT/PPTX: ${fileName}`);
      const officeParser = await import("officeparser");
      transcript = await officeParser.parseOfficeAsync(fileBuffer, {
        outputErrorToConsole: true,
        newlineDelimiter: " ",
      });
      console.log(`✅ PPT parsed. Length: ${transcript.length} chars`);

    } else if (ext === "pdf") {
      // ── PDF → pdf2json ─────────────────────────────────────
      console.log(`📄 Parsing PDF: ${fileName}`);
      const { default: PDFParser } = await import("pdf2json");

      transcript = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          try {
            const text = pdfData.Pages
              .flatMap((page) => page.Texts)
              .map((t) => decodeURIComponent(t.R.map((r) => r.T).join("")))
              .join(" ");
            resolve(text);
          } catch (e) {
            reject(new Error("Failed to extract PDF text: " + e.message));
          }
        });

        pdfParser.on("pdfParser_dataError", (err) => {
          reject(new Error("PDF parse error: " + err.parserError));
        });

        pdfParser.parseBuffer(fileBuffer);
      });

      console.log(`✅ PDF parsed. Length: ${transcript.length} chars`);

    } else {
      throw new Error(`Unsupported file type: .${ext}`);
    }

    if (!transcript || transcript.trim().length === 0) {
      throw new Error("No text could be extracted from this file");
    }

    // Clean transcript — remove null bytes and control characters
    const cleanedTranscript = transcript
      .replace(/\u0000/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    await supabase
      .from("resources")
      .update({ transcript: cleanedTranscript })
      .eq("id", resourceId);

    console.log(`📦 Chunking and storing...`);
    const chunkCount = await storeChunks(cleanedTranscript, resourceId, productId);

    await supabase
      .from("resources")
      .update({ status: "done" })
      .eq("id", resourceId);

    console.log(`🎉 Done! ${chunkCount} chunks stored for resource ${resourceId}`);

  } catch (error) {
    console.error(`❌ Processing failed:`, error);
    await supabase
      .from("resources")
      .update({ status: "failed" })
      .eq("id", resourceId);
    throw error;
  }
};

router.get("/:productId/status/:resourceId", async (req, res) => {
  const { productId, resourceId } = req.params;

  const { data: resource, error } = await supabase
    .from("resources")
    .select("id, file_name, status, created_at")
    .eq("id", resourceId)
    .eq("product_id", productId)
    .single();

  if (error || !resource) {
    return res.status(404).json({ error: "Resource not found" });
  }

  res.status(200).json({ resource });
});

router.delete("/:productId/:resourceId", async (req, res) => {
  const { productId, resourceId } = req.params;

  const { data: resource, error: fetchError } = await supabase
    .from("resources")
    .select("storage_path")
    .eq("id", resourceId)
    .eq("product_id", productId)
    .single();

  if (fetchError || !resource) {
    return res.status(404).json({ error: "Resource not found" });
  }

  await storageClient.storage
    .from("ragit-resources")
    .remove([resource.storage_path]);

  const { error: deleteError } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);

  if (deleteError) {
    return res.status(500).json({ error: "Failed to delete resource" });
  }

  res.status(200).json({ message: "Resource deleted successfully" });
});

export default router;