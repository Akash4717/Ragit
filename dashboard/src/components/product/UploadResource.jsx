import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";

const ACCEPTED_TYPES = {
  "video/mp4": "video",
  "audio/mpeg": "video",
  "audio/wav": "video",
  "application/pdf": "pdf",
  "text/plain": "text",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-powerpoint": "ppt",
};

const UploadResource = ({ productId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (selected) => {
    if (!selected) return;

    const ext = selected.name.split(".").pop().toLowerCase();
    const allowedExts = ["mp4", "mp3", "wav", "m4a", "webm", "pdf", "txt", "docx", "ppt", "pptx"];

    if (!allowedExts.includes(ext)) {
      toast.error("Unsupported file type. Use MP4, MP3, WAV, PDF, TXT, DOCX, PPT or PPTX");
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

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("File uploaded! Processing in background.");
      setFile(null);
      onUploadSuccess();
    } catch (error) {
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop().toLowerCase();
    const icons = {
      mp4: "🎬", mp3: "🎵", wav: "🎵", m4a: "🎵", webm: "🎬",
      pdf: "📕", txt: "📄", docx: "📝", ppt: "📊", pptx: "📊",
    };
    return icons[ext] || "📁";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Upload KT Resource</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload KT videos, documents, or presentations. They will be automatically
          processed and made searchable for freshers.
        </p>
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-4xl mb-3">📁</p>
          <p className="font-medium text-slate-700">
            Drop your file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported: MP4, MP3, WAV, PDF, TXT, DOCX, PPT, PPTX
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".mp4,.mp3,.wav,.m4a,.webm,.pdf,.txt,.docx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </CardContent>
      </Card>

      {/* Selected File */}
      {file && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(file.name)}</span>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                Remove
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload & Process"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">What happens after upload?</p>
        <p>1. File is stored securely in Supabase Storage</p>
        <p>2. Audio/Video is transcribed automatically via Groq Whisper</p>
        <p>3. Documents (PDF, DOCX, PPT) are parsed and text is extracted</p>
        <p>4. Content is chunked and indexed for RAG search</p>
        <p>5. Freshers can immediately start asking questions about it</p>
      </div>
    </div>
  );
};

export default UploadResource;