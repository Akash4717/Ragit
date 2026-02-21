import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

const FEATURES = [
  {
    icon: "🎙️",
    title: "Auto Transcription",
    desc: "Upload KT videos — Groq Whisper transcribes them instantly into searchable text.",
    tag: "groq whisper",
  },
  {
    icon: "🔍",
    title: "RAG Pipeline",
    desc: "Questions are matched to the most relevant chunks of your KT content using semantic search.",
    tag: "supabase + pgvector",
  },
  {
    icon: "🌐",
    title: "Multilingual",
    desc: "Freshers ask in any language. Lingo.dev detects, translates, and responds in their language.",
    tag: "lingo.dev",
  },
  {
    icon: "🔊",
    title: "Voice Playback",
    desc: "Every answer can be read aloud using Web Speech API in the fresher's native language.",
    tag: "web speech api",
  },
  {
    icon: "📦",
    title: "npm Widget",
    desc: "One npm install and two lines of code to embed the chatbot into any web app.",
    tag: "ragit-widget",
  },
  {
    icon: "🔑",
    title: "API Key Auth",
    desc: "Each chatbot gets an isolated API key. No cross-contamination between products.",
    tag: "jwt + rls",
  },
];

const STACK = [
  { name: "Groq", desc: "LLM + Whisper" },
  { name: "Supabase", desc: "DB + Storage + Auth" },
  { name: "Lingo.dev", desc: "i18n + Translation" },
  { name: "React", desc: "Dashboard UI" },
  { name: "Node.js", desc: "Backend API" },
  { name: "pgvector", desc: "Vector Search" },
];

const CODE_SNIPPET = `import { RagitChat } from 'ragit-widget';

function App() {
  return (
    <RagitChat
      apiKey="rg_live_xxxxxxxxxxxx"
      productId="your-product-id"
      theme="dark"
    />
  );
}`;

const GlitchText = ({ text }) => {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      position: "relative",
      display: "inline-block",
      color: "#1DB954",
      filter: glitching ? "blur(1px)" : "none",
      transform: glitching ? "translateX(2px)" : "none",
      transition: "all 0.05s",
    }}>
      {text}
      {glitching && (
        <span style={{
          position: "absolute", inset: 0,
          color: "#C8F5C8",
          clipPath: "inset(30% 0 50% 0)",
          transform: "translateX(-3px)",
        }}>{text}</span>
      )}
    </span>
  );
};

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Landing = () => {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const handleLoadingComplete = () => {
    setLoading(false);
    setTimeout(() => setVisible(true), 50);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0a0a0a; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }

        @keyframes scanline {
          0%   { transform: translateY(-100%); opacity: 0.3; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .nav-link:hover { color: #1DB954 !important; }
        .feature-card:hover {
          border-color: rgba(29,185,84,0.4) !important;
          background: rgba(29,185,84,0.06) !important;
          transform: translateY(-4px);
        }
        .cta-btn:hover {
          background: #22d95f !important;
          box-shadow: 0 8px 32px rgba(29,185,84,0.4) !important;
          transform: translateY(-2px);
        }
        .outline-btn:hover {
          border-color: #1DB954 !important;
          color: #1DB954 !important;
          background: rgba(29,185,84,0.05) !important;
        }
        .stack-pill:hover {
          border-color: rgba(29,185,84,0.5) !important;
          background: rgba(29,185,84,0.08) !important;
        }
      `}</style>

      {/* Loading screen */}
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}

      <div style={{
        fontFamily: "'Syne', sans-serif",
        background: "#0a0a0a",
        color: "#EBEBEB",
        minHeight: "100vh",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
      }}>

        {/* Grid background */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(29,185,84,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29,185,84,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }} />

        {/* Moving scanline */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "200px", zIndex: 0, pointerEvents: "none",
          background: "linear-gradient(transparent, rgba(29,185,84,0.015), transparent)",
          animation: "scanline 8s linear infinite",
        }} />

        {/* ── NAVBAR ── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "0 48px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(29,185,84,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "linear-gradient(135deg, #1DB954, #17a348)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "800", color: "#0a0a0a",
              fontFamily: "'Space Mono', monospace",
              boxShadow: "0 0 12px rgba(29,185,84,0.4)",
            }}>R</div>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontWeight: "700", fontSize: "15px", color: "#EBEBEB",
            }}>
              RAG<span style={{ color: "#1DB954" }}>IT</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {["Features", "Stack", "Docs"].map((item) => (
              <a key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-link"
                style={{
                  fontSize: "12px", color: "#AAAAAA",
                  fontFamily: "'Space Mono', monospace",
                  textDecoration: "none", transition: "color 0.2s",
                }}
              >{item.toLowerCase()}_</a>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="cta-btn"
              style={{
                background: "#1DB954", border: "none",
                borderRadius: "8px", padding: "8px 18px",
                color: "#0a0a0a", fontSize: "12px", fontWeight: "800",
                fontFamily: "'Space Mono', monospace",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              get_started →
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          position: "relative", zIndex: 1,
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "120px 24px 80px",
          textAlign: "center",
        }}>
          {/* Glow orb */}
          <div style={{
            position: "absolute",
            width: "600px", height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid rgba(29,185,84,0.3)",
            borderRadius: "20px", padding: "6px 14px",
            marginBottom: "32px",
            background: "rgba(29,185,84,0.05)",
            animation: "fadeInUp 0.6s ease both",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#1DB954",
              boxShadow: "0 0 8px #1DB954",
              animation: "blink 2s infinite",
            }} />
            <span style={{
              fontSize: "11px", color: "#1DB954",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.05em",
            }}>
              built by AKX · open source
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: "900",
            lineHeight: "1.0",
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            animation: "fadeInUp 0.6s ease 0.1s both",
          }}>
            Turn KT sessions<br />
            into <GlitchText text="smart" />{" "}
            <span style={{ color: "#1DB954" }}>chatbots</span>
          </h1>

          <p style={{
            fontSize: "18px", color: "#AAAAAA",
            maxWidth: "540px", lineHeight: "1.7",
            marginBottom: "40px",
            fontFamily: "'Space Mono', monospace",
            animation: "fadeInUp 0.6s ease 0.2s both",
          }}>
            Upload your KT videos and documents. Freshers ask questions
            in any language. RAGIT answers from your content — instantly.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: "flex", gap: "12px", flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeInUp 0.6s ease 0.3s both",
          }}>
            <button
              onClick={() => navigate("/login")}
              className="cta-btn"
              style={{
                background: "#1DB954", border: "none",
                borderRadius: "10px", padding: "14px 32px",
                color: "#0a0a0a", fontSize: "14px", fontWeight: "800",
                fontFamily: "'Space Mono', monospace",
                cursor: "pointer", transition: "all 0.25s",
                boxShadow: "0 4px 20px rgba(29,185,84,0.3)",
              }}
            >
              start_building →
            </button>
            <button
              className="outline-btn"
              style={{
                background: "transparent",
                border: "1px solid rgba(235,235,235,0.15)",
                borderRadius: "10px", padding: "14px 32px",
                color: "#AAAAAA", fontSize: "14px", fontWeight: "700",
                fontFamily: "'Space Mono', monospace",
                cursor: "pointer", transition: "all 0.25s",
              }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              see_how_it_works
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "48px", marginTop: "80px",
            animation: "fadeInUp 0.6s ease 0.4s both",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            {[
              { value: 10, suffix: "+", label: "languages supported" },
              { value: 6, suffix: "", label: "file formats" },
              { value: 100, suffix: "ms", label: "avg response time" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "36px", fontWeight: "900",
                  color: "#1DB954", lineHeight: "1",
                  fontFamily: "'Syne', sans-serif",
                }}>
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{
                  fontSize: "11px", color: "#555", marginTop: "4px",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{
          position: "relative", zIndex: 1,
          padding: "100px 48px",
          maxWidth: "1200px", margin: "0 auto",
        }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{
              fontSize: "11px", color: "#1DB954",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.2em", textTransform: "uppercase",
              marginBottom: "12px",
            }}>// features</p>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: "900", letterSpacing: "-0.02em",
              color: "#EBEBEB",
            }}>
              Everything you need to<br />
              <span style={{ color: "#1DB954" }}>onboard faster</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #1e1e1e",
                  borderRadius: "14px",
                  padding: "28px",
                  transition: "all 0.25s",
                  cursor: "default",
                  animation: `fadeInUp 0.5s ease ${i * 0.08}s both`,
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "14px" }}>{f.icon}</div>
                <h3 style={{
                  fontSize: "16px", fontWeight: "800",
                  color: "#EBEBEB", marginBottom: "8px",
                  fontFamily: "'Syne', sans-serif",
                }}>{f.title}</h3>
                <p style={{
                  fontSize: "12px", color: "#555",
                  lineHeight: "1.7",
                  fontFamily: "'Space Mono', monospace",
                  marginBottom: "16px",
                }}>{f.desc}</p>
                <span style={{
                  fontSize: "10px", color: "#1DB954",
                  border: "1px solid rgba(29,185,84,0.25)",
                  borderRadius: "4px", padding: "3px 8px",
                  fontFamily: "'Space Mono', monospace",
                  background: "rgba(29,185,84,0.05)",
                }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CODE SNIPPET ── */}
        <section style={{
          position: "relative", zIndex: 1,
          padding: "80px 48px",
          background: "rgba(29,185,84,0.02)",
          borderTop: "1px solid rgba(29,185,84,0.08)",
          borderBottom: "1px solid rgba(29,185,84,0.08)",
        }}>
          <div style={{
            maxWidth: "800px", margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "64px", alignItems: "center",
          }}>
            <div>
              <p style={{
                fontSize: "11px", color: "#1DB954",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.2em", textTransform: "uppercase",
                marginBottom: "12px",
              }}>// embed in 2 lines</p>
              <h2 style={{
                fontSize: "36px", fontWeight: "900",
                letterSpacing: "-0.02em", lineHeight: "1.1",
                marginBottom: "16px",
              }}>
                Drop it anywhere.<br />
                <span style={{ color: "#1DB954" }}>Just works.</span>
              </h2>
              <p style={{
                fontSize: "12px", color: "#555",
                lineHeight: "1.8",
                fontFamily: "'Space Mono', monospace",
              }}>
                Install the npm package, pass your API key and product ID.
                The chatbot handles everything — RAG, translation, voice.
              </p>
            </div>

            <div style={{
              background: "#0d0d0d",
              border: "1px solid #1e1e1e",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
              {/* Code header */}
              <div style={{
                padding: "10px 16px",
                borderBottom: "1px solid #1e1e1e",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {["#f87171", "#fbbf24", "#1DB954"].map((c, i) => (
                  <div key={i} style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: c,
                  }} />
                ))}
                <span style={{
                  fontSize: "10px", color: "#444",
                  fontFamily: "'Space Mono', monospace",
                  marginLeft: "8px",
                }}>App.jsx</span>
              </div>
              <pre style={{
                padding: "20px",
                fontSize: "11px",
                lineHeight: "1.8",
                fontFamily: "'Space Mono', monospace",
                color: "#AAAAAA",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}>
                {CODE_SNIPPET.split("\n").map((line, i) => (
                  <div key={i}>
                    {line.includes("RagitChat") && !line.includes("import")
                      ? <span style={{ color: "#1DB954" }}>{line}</span>
                      : line.includes("import") || line.includes("return")
                      ? <span style={{ color: "#60a5fa" }}>{line}</span>
                      : line.includes("apiKey") || line.includes("productId") || line.includes("theme")
                      ? <span>
                          <span style={{ color: "#AAAAAA" }}>{"  "}</span>
                          <span style={{ color: "#C8F5C8" }}>{line.trim().split("=")[0]}</span>
                          <span style={{ color: "#AAAAAA" }}>=</span>
                          <span style={{ color: "#fb923c" }}>{line.trim().split("=").slice(1).join("=")}</span>
                        </span>
                      : line}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </section>

        {/* ── TECH STACK ── */}
        <section id="stack" style={{
          position: "relative", zIndex: 1,
          padding: "100px 48px",
          maxWidth: "1000px", margin: "0 auto",
          textAlign: "center",
        }}>
          <p style={{
            fontSize: "11px", color: "#1DB954",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.2em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>// tech stack</p>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: "900", letterSpacing: "-0.02em",
            marginBottom: "48px",
          }}>
            Built on the best<br />
            <span style={{ color: "#1DB954" }}>open tools</span>
          </h2>

          <div style={{
            display: "flex", flexWrap: "wrap",
            gap: "12px", justifyContent: "center",
          }}>
            {STACK.map((s, i) => (
              <div key={i} className="stack-pill" style={{
                background: "#0d0d0d",
                border: "1px solid #1e1e1e",
                borderRadius: "10px",
                padding: "16px 24px",
                transition: "all 0.2s",
                cursor: "default",
                minWidth: "120px",
              }}>
                <div style={{
                  fontSize: "14px", fontWeight: "800",
                  color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
                  marginBottom: "4px",
                }}>{s.name}</div>
                <div style={{
                  fontSize: "10px", color: "#555",
                  fontFamily: "'Space Mono', monospace",
                }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section style={{
          position: "relative", zIndex: 1,
          padding: "100px 48px",
          textAlign: "center",
          borderTop: "1px solid rgba(29,185,84,0.08)",
        }}>
          <div style={{
            position: "absolute",
            width: "500px", height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,185,84,0.06) 0%, transparent 70%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />

          <h2 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: "900", letterSpacing: "-0.03em",
            lineHeight: "1.05", marginBottom: "20px",
            position: "relative",
          }}>
            Ready to ship<br />
            <GlitchText text="smarter" /> onboarding?
          </h2>

          <p style={{
            fontSize: "14px", color: "#555",
            fontFamily: "'Space Mono', monospace",
            marginBottom: "40px",
            position: "relative",
          }}>
            Free to use. No credit system.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="cta-btn"
            style={{
              background: "#1DB954", border: "none",
              borderRadius: "12px", padding: "18px 48px",
              color: "#0a0a0a", fontSize: "16px", fontWeight: "800",
              fontFamily: "'Space Mono', monospace",
              cursor: "pointer", transition: "all 0.25s",
              boxShadow: "0 4px 24px rgba(29,185,84,0.3)",
              position: "relative",
            }}
          >
            launch_ragit →
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          position: "relative", zIndex: 1,
          padding: "24px 48px",
          borderTop: "1px solid #111",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "12px", color: "#333",
          }}>
            RAG<span style={{ color: "#1DB954" }}>IT</span> · built by AKX
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "11px", color: "#222",
          }}>
            groq · supabase · lingo.dev · react
          </span>
        </footer>
      </div>
    </>
  );
};

export default Landing;