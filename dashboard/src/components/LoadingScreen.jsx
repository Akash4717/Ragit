import { useEffect, useState } from "react";

const BOOT_LINES = [
  "initializing ragit_v1.0...",
  "connecting to supabase...",
  "loading groq whisper model...",
  "mounting lingo.dev engine...",
  "building rag pipeline...",
  "chunking knowledge base...",
  "system ready.",
];

const LoadingScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let lineIndex = 0;

    const addLine = () => {
      if (lineIndex < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[lineIndex]]);
        setProgress(Math.round(((lineIndex + 1) / BOOT_LINES.length) * 100));
        lineIndex++;
        setTimeout(addLine, 300 + Math.random() * 200);
      } else {
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 600);
        }, 400);
      }
    };

    setTimeout(addLine, 300);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0a0a0a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      opacity: done ? 0 : 1,
      transition: "opacity 0.6s ease",
      fontFamily: "'Space Mono', monospace",
    }}>
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(29,185,84,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(29,185,84,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Scanline */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "480px",
        padding: "0 32px",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            justifyContent: "center",
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #1DB954, #17a348)",
            borderRadius: "14px",
            fontSize: "22px", fontWeight: "800",
            color: "#0a0a0a",
            boxShadow: "0 0 40px rgba(29,185,84,0.5)",
            marginBottom: "16px",
          }}>R</div>
          <div style={{
            fontSize: "13px", color: "#1DB954",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}>
            RAGIT SYSTEM BOOT
          </div>
        </div>

        {/* Terminal lines */}
        <div style={{
          background: "#0d0d0d",
          border: "1px solid #1e1e1e",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "200px",
          marginBottom: "24px",
        }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              fontSize: "12px",
              color: i === lines.length - 1 ? "#1DB954" : "#444",
              marginBottom: "6px",
              animation: "fadeInUp 0.3s ease",
            }}>
              <span style={{ color: "#1DB954", marginRight: "8px" }}>›</span>
              {line}
              {i === lines.length - 1 && !done && (
                <span style={{
                  display: "inline-block",
                  width: "7px", height: "13px",
                  background: "#1DB954",
                  marginLeft: "4px",
                  animation: "blink 1s infinite",
                  verticalAlign: "middle",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          height: "2px",
          background: "#1a1a1a",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #1DB954, #22d95f)",
            borderRadius: "2px",
            transition: "width 0.3s ease",
            boxShadow: "0 0 10px rgba(29,185,84,0.6)",
          }} />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: "8px",
          fontSize: "10px", color: "#333",
        }}>
          <span>loading...</span>
          <span style={{ color: progress === 100 ? "#1DB954" : "#333" }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;