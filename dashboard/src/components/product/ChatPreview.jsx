import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { SUPPORTED_LOCALES } from "../../lib/constants";

const LOCALE_TO_SPEECH_LANG = {
  en: "en-US", hi: "hi-IN", es: "es-ES", fr: "fr-FR",
  de: "de-DE", zh: "zh-CN", ja: "ja-JP", ar: "ar-SA",
  pt: "pt-BR", ru: "ru-RU",
};

const useSpeech = () => {
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const speak = (text, locale, index) => {
    if (!window.speechSynthesis) {
      toast.error("Browser doesn't support text-to-speech");
      return;
    }
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE_TO_SPEECH_LANG[locale] || "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);
  };

  return { speak, stop, speakingIndex };
};

const SoundwaveIcon = () => (
  <span style={{ display: "flex", gap: "2px", alignItems: "center", height: "12px" }}>
    {[0, 1, 2, 1, 0].map((h, i) => (
      <span key={i} style={{
        width: "2px",
        height: `${4 + h * 3}px`,
        background: "#1DB954",
        borderRadius: "2px",
        animation: "soundwave 0.8s ease infinite",
        animationDelay: `${i * 0.1}s`,
      }} />
    ))}
  </span>
);

const MessageBubble = ({ message, index, onSpeak, speakingIndex }) => {
  const isBot = message.role === "bot";
  const isSpeaking = speakingIndex === index;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isBot ? "flex-start" : "flex-end",
      gap: "4px",
    }}>
      {/* Label */}
      <span style={{
        fontSize: "10px",
        color: "#555",
        fontFamily: "'Space Mono', monospace",
        paddingLeft: isBot ? "4px" : "0",
        paddingRight: isBot ? "0" : "4px",
      }}>
        {isBot ? "ragit_ai" : "you"}
      </span>

      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8px",
        flexDirection: isBot ? "row" : "row-reverse",
      }}>
        {/* Bubble */}
        <div style={{
          maxWidth: "72%",
          padding: "12px 16px",
          borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
          background: isBot
            ? "linear-gradient(135deg, #161616, #1a1a1a)"
            : "linear-gradient(135deg, #1DB954, #17a348)",
          border: isBot ? "1px solid #2a2a2a" : "none",
          color: isBot ? "#EBEBEB" : "#0a0a0a",
          fontSize: "13px",
          lineHeight: "1.65",
          fontFamily: isBot ? "'Space Mono', monospace" : "'Syne', sans-serif",
          fontWeight: isBot ? "400" : "600",
          boxShadow: isBot
            ? "0 2px 12px rgba(0,0,0,0.3)"
            : "0 2px 16px rgba(29,185,84,0.25)",
        }}>
          {message.content}
        </div>

        {/* Speak button */}
        {isBot && (
          <button
            onClick={() => onSpeak(message.content, index)}
            title={isSpeaking ? "Stop" : "Listen"}
            style={{
              width: "28px", height: "28px",
              borderRadius: "50%",
              background: isSpeaking ? "rgba(29,185,84,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isSpeaking ? "#1DB954" : "#2a2a2a"}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
              marginBottom: "2px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1DB954";
              e.currentTarget.style.background = "rgba(29,185,84,0.1)";
            }}
            onMouseLeave={(e) => {
              if (!isSpeaking) {
                e.currentTarget.style.borderColor = "#2a2a2a";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }
            }}
          >
            {isSpeaking
              ? <SoundwaveIcon />
              : <span style={{ fontSize: "12px" }}>🔊</span>
            }
          </button>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
    <span style={{ fontSize: "10px", color: "#555", fontFamily: "'Space Mono', monospace", paddingLeft: "4px" }}>
      ragit_ai
    </span>
    <div style={{
      padding: "12px 16px",
      borderRadius: "4px 16px 16px 16px",
      background: "linear-gradient(135deg, #161616, #1a1a1a)",
      border: "1px solid #2a2a2a",
    }}>
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#1DB954",
            animation: "bounce 1.2s ease infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  </div>
);

const ChatPreview = ({ productId, productName }) => {
  const [messages, setMessages] = useState([{
    role: "bot",
    content: `Hi! I'm the ${productName} assistant. Ask me anything — I'll answer from your KT materials.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [totalChunks, setTotalChunks] = useState(0);
  const bottomRef = useRef(null);
  const { speak, stop, speakingIndex } = useSpeech();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    stop();
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("ragit_session"))?.access_token}`,
        },
        body: JSON.stringify({ productId, message: trimmed, targetLocale: selectedLocale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setMessages((prev) => [...prev, { role: "bot", content: data.answer }]);
      setTotalChunks((prev) => prev + (data.chunksUsed || 0));
    } catch {
      toast.error("Failed to get response.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocaleChange = async (newLocale) => {
    if (newLocale === selectedLocale) return;
    stop();
    setTranslating(true);
    const prev = selectedLocale;
    setSelectedLocale(newLocale);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/translate-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("ragit_session"))?.access_token}`,
        },
        body: JSON.stringify({ messages: messages.map((m) => m.content), targetLocale: newLocale }),
      });
      const data = await res.json();
      if (res.ok && data.translatedMessages) {
        setMessages((msgs) => msgs.map((msg, i) => ({ ...msg, content: data.translatedMessages[i] || msg.content })));
        toast.success(`Translated to ${SUPPORTED_LOCALES.find(l => l.code === newLocale)?.label}`);
      }
    } catch {
      setSelectedLocale(prev);
      toast.error("Translation failed.");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.7; }
          50%       { transform: scaleY(1.4); opacity: 1; }
        }
        .chat-input:focus { border-color: #1DB954 !important; box-shadow: 0 0 0 3px rgba(29,185,84,0.1); }
        .send-btn:hover:not(:disabled) { background: #22d95f !important; transform: translateY(-1px); }
        .send-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "680px", margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{
              fontSize: "20px", fontWeight: "800",
              color: "#EBEBEB", fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.3px",
            }}>
              Test Chatbot
            </h2>
            <p style={{ fontSize: "12px", color: "#555", marginTop: "3px", fontFamily: "'Space Mono', monospace" }}>
              RAG · Groq · Lingo.dev · Web Speech
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {totalChunks > 0 && (
              <span style={{
                fontSize: "11px", color: "#1DB954",
                border: "1px solid rgba(29,185,84,0.25)",
                borderRadius: "20px", padding: "3px 10px",
                fontFamily: "'Space Mono', monospace",
                background: "rgba(29,185,84,0.05)",
              }}>
                ⚡ {totalChunks} chunks
              </span>
            )}
            <button
              onClick={() => { stop(); setMessages([{ role: "bot", content: `Hi! I'm the ${productName} assistant.` }]); setTotalChunks(0); }}
              style={{
                background: "transparent", border: "1px solid #2a2a2a",
                color: "#555", padding: "5px 12px", borderRadius: "6px",
                fontSize: "11px", fontFamily: "'Space Mono', monospace",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#AAAAAA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#555"; }}
            >
              clear_
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div style={{
  borderRadius: "16px", overflow: "hidden",
  border: "1px solid #222",
  background: "#111",
  boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(29,185,84,0.05)",
  maxWidth: "640px",
  width: "100%",
  margin: "0 auto",
}}>

          {/* Top bar */}
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid #1e1e1e",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#0d0d0d",
          }}>
            {/* Bot info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px",
                background: "linear-gradient(135deg, #1DB954, #17a348)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0a0a0a", fontSize: "12px", fontWeight: "800",
                fontFamily: "'Space Mono', monospace",
                boxShadow: "0 0 16px rgba(29,185,84,0.35)",
              }}>AI</div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#EBEBEB", fontFamily: "'Syne', sans-serif" }}>
                  {productName}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "1px" }}>
                  <div style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: "#1DB954",
                    boxShadow: "0 0 6px #1DB954",
                  }} />
                  <span style={{ fontSize: "10px", color: "#555", fontFamily: "'Space Mono', monospace" }}>
                    online
                  </span>
                </div>
              </div>
            </div>

            {/* Language selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {translating && (
                <span style={{ fontSize: "10px", color: "#1DB954", fontFamily: "'Space Mono', monospace" }}>
                  translating...
                </span>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "#161616", border: "1px solid #2a2a2a",
                borderRadius: "8px", padding: "5px 10px",
              }}>
                <span style={{ fontSize: "12px" }}>🌐</span>
                <select
                  value={selectedLocale}
                  onChange={(e) => handleLocaleChange(e.target.value)}
                  disabled={translating || loading}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "#EBEBEB", fontSize: "11px", cursor: "pointer",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {SUPPORTED_LOCALES.map((l) => (
                    <option key={l.code} value={l.code} style={{ background: "#161616" }}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            height: "420px", overflowY: "auto",
            padding: "20px 18px",
            display: "flex", flexDirection: "column", gap: "18px",
            background: "#111",
          }}>
            {messages.map((msg, i) => (
              <MessageBubble
                key={i} message={msg} index={i}
                onSpeak={(text, idx) => speak(text, selectedLocale, idx)}
                speakingIndex={speakingIndex}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "14px 18px",
            borderTop: "1px solid #1e1e1e",
            display: "flex", gap: "8px",
            background: "#0d0d0d",
          }}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Message in ${SUPPORTED_LOCALES.find(l => l.code === selectedLocale)?.label || "English"}...`}
              disabled={loading || translating}
              style={{
                flex: 1, background: "#161616",
                border: "1px solid #2a2a2a", borderRadius: "10px",
                padding: "11px 16px", color: "#EBEBEB",
                fontSize: "13px", outline: "none",
                fontFamily: "'Space Mono', monospace",
                transition: "all 0.2s",
              }}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim() || translating}
              style={{
                background: input.trim() && !loading && !translating ? "#1DB954" : "#1a1a1a",
                border: "none", borderRadius: "10px",
                padding: "11px 22px",
                color: input.trim() && !loading && !translating ? "#0a0a0a" : "#444",
                fontSize: "12px", fontWeight: "800",
                fontFamily: "'Space Mono', monospace",
                cursor: input.trim() && !loading && !translating ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {loading ? "···" : "send →"}
            </button>
          </div>
        </div>

        {/* Info pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            "🔊 Click speak on any message to hear it",
            "🌐 Switch language to translate chat",
            "📚 Answers from KT materials only",
          ].map((tip, i) => (
            <span key={i} style={{
              fontSize: "11px", color: "#555",
              border: "1px solid #1e1e1e",
              borderRadius: "20px", padding: "4px 12px",
              fontFamily: "'Space Mono', monospace",
              background: "#0d0d0d",
            }}>{tip}</span>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatPreview;