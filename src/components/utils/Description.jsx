import { useState, memo } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Description = memo(function Description({ dataObj }) {
  const { heading, subheading, summary, lang, code } = dataObj;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full rounded-2xl border overflow-hidden"
      style={{ background: "oklch(0.13 0.025 240)", borderColor: "oklch(0.22 0.04 240)" }}>
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "oklch(0.2 0.04 240)", background: "oklch(0.15 0.03 240)" }}>
        {heading && (
          <h2 className="text-xl font-bold text-white mb-1">{heading}</h2>
        )}
        {subheading && (
          <p className="text-sm" style={{ color: "oklch(0.75 0.18 195)" }}>{subheading}</p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div
          className="px-6 py-5 text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none
            prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: summary }}
        />
      )}

      {/* Code */}
      {code && (
        <div className="px-6 pb-6">
          <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.22 0.04 240)" }}>
            {/* Code header bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b"
              style={{ background: "oklch(0.17 0.03 240)", borderColor: "oklch(0.22 0.04 240)" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-slate-500 font-mono">{lang || "python"}</span>
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all"
                style={{
                  background: copied ? "oklch(0.75 0.18 195 / 0.15)" : "oklch(0.2 0.04 240)",
                  color: copied ? "oklch(0.75 0.18 195)" : "#94a3b8",
                  border: `1px solid ${copied ? "oklch(0.75 0.18 195 / 0.4)" : "oklch(0.28 0.05 240)"}`,
                }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <SyntaxHighlighter
              language={lang || "python"}
              style={vscDarkPlus}
              wrapLines
              wrapLongLines
              customStyle={{ margin: 0, padding: "1.25rem", background: "oklch(0.11 0.02 240)", fontSize: "0.8rem" }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
});

export default Description;
