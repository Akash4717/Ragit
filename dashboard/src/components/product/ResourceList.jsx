import { useState } from "react";
import api from "../../lib/api";
import { toast } from "sonner";

const FILE_META = {
  mp4:  { icon: "🎬", label: "Video" },
  webm: { icon: "🎬", label: "Video" },
  mp3:  { icon: "🎵", label: "Audio" },
  wav:  { icon: "🎵", label: "Audio" },
  m4a:  { icon: "🎵", label: "Audio" },
  pdf:  { icon: "📕", label: "PDF"   },
  txt:  { icon: "📄", label: "Text"  },
  docx: { icon: "📝", label: "Word"  },
  ppt:  { icon: "📊", label: "PPT"   },
  pptx: { icon: "📊", label: "PPT"   },
  video: { icon: "🎬", label: "Video" },
  audio: { icon: "🎵", label: "Audio" },
  text:  { icon: "📄", label: "Text"  },
};

const STATUS_META = {
  pending:    { color: "#AAAAAA", bg: "rgba(170,170,170,0.08)", dot: "#AAAAAA", label: "pending"    },
  processing: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  dot: "#60a5fa", label: "processing" },
  done:       { color: "#1DB954", bg: "rgba(29,185,84,0.08)",   dot: "#1DB954", label: "done"       },
  failed:     { color: "#f87171", bg: "rgba(248,113,113,0.08)", dot: "#f87171", label: "failed"     },
};

// ── Custom Confirm Modal ──────────────────────────────────────
const DeleteModal = ({ fileName, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "fadeInUp 0.2s ease",
  }}>
    <div style={{
      background: "#111",
      border: "1px solid #2a2a2a",
      borderRadius: "16px",
      padding: "32px",
      width: "100%", maxWidth: "400px",
      margin: "24px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      animation: "fadeInUp 0.25s ease",
    }}>
      {/* Icon */}
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        background: "rgba(248,113,113,0.1)",
        border: "1px solid rgba(248,113,113,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", marginBottom: "20px",
      }}>🗑️</div>

      {/* Title */}
      <h3 style={{
        fontSize: "17px", fontWeight: "800",
        color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
        marginBottom: "8px",
      }}>Delete resource?</h3>

      {/* File name */}
      <p style={{
        fontSize: "11px", color: "#555",
        fontFamily: "'Space Mono', monospace",
        marginBottom: "6px",
      }}>
        This will permanently delete:
      </p>
      <div style={{
        background: "#0d0d0d",
        border: "1px solid #1e1e1e",
        borderRadius: "8px",
        padding: "10px 14px",
        marginBottom: "20px",
      }}>
        <span style={{
          fontSize: "12px", color: "#EBEBEB",
          fontFamily: "'Space Mono', monospace",
          wordBreak: "break-all",
        }}>
          {fileName}
        </span>
      </div>

      {/* Warning */}
      <div style={{
        background: "rgba(248,113,113,0.06)",
        border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: "8px",
        padding: "10px 14px",
        marginBottom: "24px",
        display: "flex", gap: "8px", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "12px", flexShrink: 0 }}>⚠️</span>
        <span style={{
          fontSize: "11px", color: "#f87171",
          fontFamily: "'Space Mono', monospace",
          lineHeight: "1.6",
        }}>
          All chunks and transcripts from this file will also be deleted. This cannot be undone.
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, background: "transparent",
            border: "1px solid #2a2a2a",
            borderRadius: "8px", padding: "10px",
            color: "#AAAAAA", fontSize: "12px",
            fontFamily: "'Space Mono', monospace",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#444";
            e.currentTarget.style.color = "#EBEBEB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2a2a2a";
            e.currentTarget.style.color = "#AAAAAA";
          }}
        >
          cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, background: "rgba(248,113,113,0.15)",
            border: "1px solid rgba(248,113,113,0.4)",
            borderRadius: "8px", padding: "10px",
            color: "#f87171", fontSize: "12px", fontWeight: "800",
            fontFamily: "'Space Mono', monospace",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.25)";
            e.currentTarget.style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.15)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)";
          }}
        >
          delete →
        </button>
      </div>
    </div>
  </div>
);

const ResourceList = ({ resources, productId, onRefresh }) => {
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/upload/${productId}/${confirmDelete.id}`);
      toast.success("Resource deleted");
      setConfirmDelete(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete resource");
      setConfirmDelete(null);
    }
  };

  if (resources.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "64px 24px", gap: "12px",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: "rgba(29,185,84,0.06)",
          border: "1px solid rgba(29,185,84,0.15)",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "22px",
        }}>📭</div>
        <p style={{
          fontSize: "14px", fontWeight: "700",
          color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
        }}>No resources yet</p>
        <p style={{
          fontSize: "11px", color: "#555",
          fontFamily: "'Space Mono', monospace",
          textAlign: "center",
        }}>
          Go to the Upload tab to add KT videos or documents
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .resource-row:hover { background: rgba(29,185,84,0.03) !important; }
        .delete-btn:hover { border-color: #f87171 !important; color: #f87171 !important; }
        .processing-dot { animation: pulse-dot 1.5s ease infinite; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Custom Delete Modal */}
      {confirmDelete && (
        <DeleteModal
          fileName={confirmDelete.name}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0 16px 0",
        }}>
          <h2 style={{
            fontSize: "20px", fontWeight: "800",
            color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
          }}>KT Resources</h2>
          <span style={{
            fontSize: "11px", color: "#1DB954",
            border: "1px solid rgba(29,185,84,0.25)",
            borderRadius: "20px", padding: "3px 10px",
            fontFamily: "'Space Mono', monospace",
            background: "rgba(29,185,84,0.05)",
          }}>
            {resources.length} file{resources.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div style={{
          borderRadius: "12px",
          border: "1px solid #1e1e1e",
          background: "#0d0d0d",
          overflow: "hidden",
        }}>
          {/* Table Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 120px 80px",
            padding: "10px 16px",
            borderBottom: "1px solid #1e1e1e",
            background: "#111",
          }}>
            {["file", "type", "status", ""].map((col, i) => (
              <span key={i} style={{
                fontSize: "10px", color: "#444",
                fontFamily: "'Space Mono', monospace",
                fontWeight: "700", textTransform: "uppercase",
                letterSpacing: "0.08em",
                textAlign: i === 3 ? "right" : "left",
              }}>{col}</span>
            ))}
          </div>

          {/* Rows */}
          {resources.map((resource, i) => {
            const ext = resource.file_name.split(".").pop().toLowerCase();
            const meta = FILE_META[ext] || FILE_META[resource.file_type] || { icon: "📁", label: "File" };
            const status = STATUS_META[resource.status] || STATUS_META.pending;

            return (
              <div
                key={resource.id}
                className="resource-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 120px 80px",
                  padding: "14px 16px",
                  borderBottom: i < resources.length - 1 ? "1px solid #161616" : "none",
                  alignItems: "center",
                  transition: "background 0.15s",
                  background: "transparent",
                }}
              >
                {/* File name */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{meta.icon}</span>
                  <div>
                    <p style={{
                      fontSize: "12px", fontWeight: "700",
                      color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
                      maxWidth: "220px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {resource.file_name}
                    </p>
                    <p style={{
                      fontSize: "10px", color: "#444",
                      fontFamily: "'Space Mono', monospace", marginTop: "2px",
                    }}>
                      {new Date(resource.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <span style={{
                  fontSize: "10px", color: "#AAAAAA",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {meta.label}
                </span>

                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    className={resource.status === "processing" ? "processing-dot" : ""}
                    style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: status.dot,
                      boxShadow: resource.status === "done" ? `0 0 6px ${status.dot}` : "none",
                    }}
                  />
                  <span style={{
                    fontSize: "10px", color: status.color,
                    fontFamily: "'Space Mono', monospace",
                    background: status.bg,
                    border: `1px solid ${status.color}33`,
                    borderRadius: "4px", padding: "2px 7px",
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Delete */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="delete-btn"
                    onClick={() => setConfirmDelete({ id: resource.id, name: resource.file_name })}
                    style={{
                      background: "transparent",
                      border: "1px solid #2a2a2a",
                      borderRadius: "6px", padding: "4px 10px",
                      color: "#555", fontSize: "10px",
                      fontFamily: "'Space Mono', monospace",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ResourceList;