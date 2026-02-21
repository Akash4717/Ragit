import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
};

const CodeBlock = ({ code, language = "bash" }) => (
  <div className="relative rounded-xl overflow-hidden border border-slate-700">
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
      <span className="text-xs text-slate-400 font-mono">{language}</span>
      <CopyButton text={code} />
    </div>
    <pre className="bg-slate-900 px-4 py-4 overflow-x-auto">
      <code className="text-sm text-slate-100 font-mono leading-relaxed">
        {code}
      </code>
    </pre>
  </div>
);

const EmbedCode = ({ productId, apiKey, productName }) => {
  const [showKey, setShowKey] = useState(false);

  const installCode = `npm install ragit-widget`;

  const usageCode = `import { RagitWidget } from 'ragit-widget';

function App() {
  return (
    <>
      {/* Your existing app */}
      <RagitWidget
        apiKey="${apiKey}"
        productId="${productId}"
        title="${productName} Assistant"
        placeholder="Ask me anything about ${productName}..."
      />
    </>
  );
}`;

  const scriptCode = `<!-- Add before closing </body> tag -->
<script 
  src="https://cdn.ragit.dev/widget.js"
  data-api-key="${apiKey}"
  data-product-id="${productId}"
  data-title="${productName} Assistant"
></script>`;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Embed & API</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Integrate <span className="font-medium text-green-500">{productName}</span> chatbot
          into any internal tool in minutes
        </p>
      </div>

      {/* Credentials Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-linear-to-br from-primary to-primary/90 border-0 text-primary-foreground">
          <CardContent className="pt-6">
            <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider mb-1">
              Product ID
            </p>
            <p className="font-mono text-sm break-all">{productId}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(productId);
                toast.success("Product ID copied!");
              }}
              className="mt-3 text-xs text-primary-foreground/80 hover:text-green-500 transition-colors"
            >
              Click to copy →
            </button>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-secondary to-secondary/80 border-0 text-secondary-foreground">
          <CardContent className="pt-6">
            <p className="text-secondary-foreground/80 text-xs font-medium uppercase tracking-wider mb-1">
              API Key
            </p>
            <p className="font-mono text-sm break-all">
              {showKey ? apiKey : "rg_••••••••••••••••••••••••••••••••"}
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs text-slate-400 hover:text-green-500 transition-colors"
              >
                {showKey ? "Hide" : "Reveal"} →
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  toast.success("API Key copied!");
                }}
                className="text-xs text-slate-400 hover:text-green-500 transition-colors"
              >
                Copy →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Keep your API key secret</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Never expose your API key in public repositories or client-side code
            outside your internal tools.
          </p>
        </div>
      </div>

      {/* Integration Steps */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <h3 className="font-semibold text-green-500">Install the package</h3>
          </div>
          <CodeBlock code={installCode} language="bash" />
        </div>

        {/* Step 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <h3 className="font-semibold text-green-500">Add to your React app</h3>
          </div>
          <CodeBlock code={usageCode} language="jsx" />
        </div>

        {/* Step 3 - Alternative */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
              OR
            </div>
            <div>
              <h3 className="font-semibold text-green-500">Use the script tag</h3>
              <p className="text-xs text-muted-foreground">For non-React projects</p>
            </div>
          </div>
          <CodeBlock code={scriptCode} language="html" />
        </div>
      </div>

      {/* How it works */}
      <Card className="bg-slate-900 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How it works for freshers</CardTitle>
          <CardDescription>
            Once embedded, the chatbot automatically handles everything
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: "💬", label: "Fresher asks", desc: "Question in any language" },
              { icon: "🌐", label: "Lingo.dev", desc: "Detects & translates to English" },
              { icon: "🔍", label: "RAG Search", desc: "Finds relevant KT chunks" },
              { icon: "✅", label: "Groq answers", desc: "Reply in fresher's language" },
            ].map((step, i) => (
              <div key={i} className="text-center p-3 bg-white rounded-lg border border-slate-100">
                <p className="text-2xl mb-2">{step.icon}</p>
                <p className="text-xs font-semibold text-slate-700">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbedCode;