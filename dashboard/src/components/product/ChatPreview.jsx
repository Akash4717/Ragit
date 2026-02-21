import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { SUPPORTED_LOCALES } from "../../lib/constants";

const MessageBubble = ({ message }) => {
  const isBot = message.role === "bot";

  return (
    <div className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground text-xs font-bold mt-1">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? "bg-slate-700 border border-slate-600 text-foreground shadow-sm rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        }`}
      >
        {message.content}
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0 text-muted-foreground text-xs font-bold mt-1">
          You
        </div>
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 justify-start">
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground text-xs font-bold">
      AI
    </div>
    <div className="bg-slate-700 border border-slate-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

const ChatPreview = ({ productId, productName }) => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: `Hi! I'm the ${productName} assistant. Ask me anything about the product — I'll answer based on the KT materials uploaded.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [totalChunksUsed, setTotalChunksUsed] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("ragit_session"))?.access_token
            }`,
          },
          body: JSON.stringify({
            productId,
            message: trimmed,
            // Pass selected locale so backend translates response to this language
            targetLocale: selectedLocale,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.answer },
      ]);

      setTotalChunksUsed((prev) => prev + (data.chunksUsed || 0));
    } catch (error) {
      toast.error("Failed to get response. Is your backend running?");
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Translate all existing messages when language is changed
  const handleLocaleChange = async (newLocale) => {
    if (newLocale === selectedLocale) return;

    setTranslating(true);
    const prevLocale = selectedLocale;
    setSelectedLocale(newLocale);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/translate-messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("ragit_session"))?.access_token
            }`,
          },
          body: JSON.stringify({
            messages: messages.map((m) => m.content),
            targetLocale: newLocale,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.translatedMessages) {
        setMessages((prev) =>
          prev.map((msg, i) => ({
            ...msg,
            content: data.translatedMessages[i] || msg.content,
          }))
        );
        toast.success(`Chat translated to ${SUPPORTED_LOCALES.find(l => l.code === newLocale)?.label}`);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setSelectedLocale(prevLocale); // revert on failure
      toast.error("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        content: `Hi! I'm the ${productName} assistant. Ask me anything about the product.`,
      },
    ]);
    setTotalChunksUsed(0);
  };

  const currentLocaleLabel = SUPPORTED_LOCALES.find(
    (l) => l.code === selectedLocale
  )?.label || "English";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Test Your Chatbot</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ask questions as a fresher would — powered by your uploaded KT materials
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalChunksUsed > 0 && (
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              🔍 {totalChunksUsed} chunks used
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={clearChat} className="border-border hover:border-primary hover:text-primary">
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="border border-border rounded-2xl overflow-hidden shadow-lg bg-background max-w-2xl">

        {/* Chat Header with Language Dropdown */}
        <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{productName} Assistant</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">Online · Powered by Lingo.dev</p>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            {translating && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Translating...
              </span>
            )}
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary rounded-lg px-2 py-1 hover:bg-primary/20 transition-colors relative">
              <span className="text-sm">🌐</span>
              <select
                value={selectedLocale}
                onChange={(e) => handleLocaleChange(e.target.value)}
                disabled={translating || loading}
                className="text-xs bg-transparent border-none outline-none cursor-pointer text-primary font-medium disabled:text-muted-foreground appearance-none pr-5"
                style={{
                  color: "var(--primary)",
                  backgroundColor: "transparent",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231DB954' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  backgroundSize: "12px",
                  paddingRight: "18px",
                }}
              >
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale.code} value={locale.code} style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto px-4 py-4 space-y-3 bg-background">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="bg-background border-t border-border px-4 py-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask in ${currentLocaleLabel} or any language...`}
            disabled={loading || translating}
            className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim() || translating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5"
          >
            {loading ? "..." : "Send"}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: "🌐", tip: "Switch language from the dropdown to translate the entire chat instantly" },
          { icon: "📚", tip: "Questions are answered from your KT materials only" },
          { icon: "🔍", tip: "More KT uploads = better and more accurate answers" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl px-4 py-3 flex gap-3 items-start"
          >
            <span className="text-lg">{item.icon}</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPreview;