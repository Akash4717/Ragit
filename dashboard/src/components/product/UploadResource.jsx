import { useState, useRef } from "react";
import { toast } from "sonner";

const ALLOWED_EXTENSIONS = ["mp4", "mp3", "wav", "m4a", "webm", "pdf", "txt", "docx", "ppt", "pptx"];

const FILE_META = {
  mp4:  { icon: "🎬", label: "Video", color: "#a78bfa" },
  webm: { icon: "🎬", label: "Video", color: "#a78bfa" },
  mp3:  { icon: "🎵", label: "Audio", color: "#60a5fa" },
  wav:  { icon: "🎵", label: "Audio", color: "#60a5fa" },
  m4a:  { icon: "🎵", label: "Audio", color: "#60a5fa" },
  pdf:  { icon: "📕", label: "PDF",   color: "#f87171" },
  txt:  { icon: "📄", label: "Text",  color: "#AAAAAA" },
  docx: { icon: "📝", label: "Word",  color: "#60a5fa" },
  ppt:  { icon: "📊", label: "PPT",   color: "#fb923c" },
  pptx: { icon: "📊", label: "PPT",   color: "#fb923c" },
};

const PIPELINE_STEPS = [
  { icon: "☁️", label: "Stored in Supabase Storage" },
  { icon: "🎙️", label: "Audio/Video transcribed via Groq Whisper" },
  { icon: "📑", label: "Documents parsed & text extracted" },
  { icon: "🔪", label: "Content chunked for RAG indexing" },
  { icon: "✅", label: "Freshers can ask questions instantly" },
];

const UploadResource = ({ productId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (selected) => {
    if (!selected) return;
    const ext = selected.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Unsupported file type");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resource", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("ragit_session"))?.access_token
            }`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      toast.success("Uploaded! Processing in background.");
      setFile(null);
      onUploadSuccess();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const ext = file?.name.split(".").pop().toLowerCase();
  const fileMeta = FILE_META[ext] || { icon: "📁", label: "File", color: "#AAAAAA" };

  return (
    <>
      <style>{`
        .upload-zone:hover { border-color: rgba(29,185,84,0.5) !important; background: rgba(29,185,84,0.04) !important; }
        .upload-zone.drag-over { border-color: #1DB954 !important; background: rgba(29,185,84,0.08) !important; box-shadow: 0 0 30px rgba(29,185,84,0.1); }
        .remove-btn:hover { border-color: #f87171 !important; color: #f87171 !important; }
        .upload-btn:hover:not(:disabled) { background: #22d95f !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(29,185,84,0.3); }
        .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px" }}>

        {/* Header */}
        <div>
          <h2 style={{
            fontSize: "20px", fontWeight: "800",
            color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
            letterSpacing: "-0.3px",
          }}>
            Upload KT Resource
          </h2>
          <p style={{
            fontSize: "12px", color: "#555",
            marginTop: "4px", fontFamily: "'Space Mono', monospace",
          }}>
            Videos, documents, and presentations — all supported
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          style={{
            border: "1px dashed rgba(29,185,84,0.25)",
            borderRadius: "14px",
            padding: "48px 24px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", gap: "12px",
            background: "rgba(29,185,84,0.02)",
            transition: "all 0.2s",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Corner accents */}
          {["0,0", "0,100%", "100%,0", "100%,100%"].map((pos, i) => {
            const [l, t] = pos.split(",");
            return (
              <div key={i} style={{
                position: "absolute", left: l, top: t,
                width: "16px", height: "16px",
                borderTop: i < 2 ? "2px solid rgba(29,185,84,0.4)" : "none",
                borderBottom: i >= 2 ? "2px solid rgba(29,185,84,0.4)" : "none",
                borderLeft: i % 2 === 0 ? "2px solid rgba(29,185,84,0.4)" : "none",
                borderRight: i % 2 !== 0 ? "2px solid rgba(29,185,84,0.4)" : "none",
                transform: `translate(${i % 2 !== 0 ? "-" : ""}2px, ${i >= 2 ? "-" : ""}2px)`,
              }} />
            );
          })}

          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "rgba(29,185,84,0.08)",
            border: "1px solid rgba(29,185,84,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px",
          }}>
            {dragOver ? "✨" : "📂"}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "14px", fontWeight: "700",
              color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
            }}>
              {dragOver ? "Drop it here" : "Drop file or click to browse"}
            </p>
            <p style={{
              fontSize: "11px", color: "#555",
              marginTop: "4px", fontFamily: "'Space Mono', monospace",
            }}>
              MP4 · MP3 · WAV · PDF · TXT · DOCX · PPT · PPTX
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".mp4,.mp3,.wav,.m4a,.webm,.pdf,.txt,.docx,.ppt,.pptx"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Selected File Card */}
        {file && (
          <div style={{
            borderRadius: "12px",
            border: "1px solid rgba(29,185,84,0.3)",
            background: "rgba(29,185,84,0.05)",
            padding: "16px 20px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "16px",
            animation: "fadeInUp 0.3s ease",
          }}>
            {/* File info */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                background: "#161616",
                border: `1px solid ${fileMeta.color}33`,
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px",
                flexShrink: 0,
              }}>
                {fileMeta.icon}
              </div>
              <div>
                <p style={{
                  fontSize: "13px", fontWeight: "700",
                  color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
                  maxWidth: "260px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {file.name}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                  <span style={{
                    fontSize: "10px", color: fileMeta.color,
                    border: `1px solid ${fileMeta.color}44`,
                    borderRadius: "4px", padding: "1px 6px",
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {fileMeta.label}
                  </span>
                  <span style={{
                    fontSize: "10px", color: "#555",
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                className="remove-btn"
                onClick={() => setFile(null)}
                disabled={uploading}
                style={{
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px", padding: "8px 14px",
                  color: "#AAAAAA", fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                remove
              </button>
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  background: "#1DB954",
                  border: "none", borderRadius: "8px",
                  padding: "8px 18px",
                  color: "#0a0a0a", fontSize: "11px",
                  fontWeight: "800",
                  fontFamily: "'Space Mono', monospace",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {uploading ? "uploading..." : "upload →"}
              </button>
            </div>
          </div>
        )}

        {/* Pipeline Steps */}
        <div style={{
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
          background: "#0d0d0d",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid #1e1e1e",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#1DB954",
              boxShadow: "0 0 6px #1DB954",
            }} />
            <span style={{
              fontSize: "11px", color: "#AAAAAA",
              fontFamily: "'Space Mono', monospace",
              fontWeight: "700",
            }}>
              processing_pipeline
            </span>
          </div>

          <div style={{ padding: "4px 0" }}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 16px",
                borderBottom: i < PIPELINE_STEPS.length - 1 ? "1px solid #161616" : "none",
              }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(29,185,84,0.1)",
                  border: "1px solid rgba(29,185,84,0.2)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "10px",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <span style={{
                  fontSize: "11px", color: "#555",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  <span style={{ marginRight: "8px" }}>{step.icon}</span>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadResource;