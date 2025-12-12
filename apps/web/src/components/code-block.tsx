"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, FileCode, FileJson, FileText, ChevronRight } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: "bash" | "javascript" | "typescript" | "json" | "python" | "ruby" | "text" | "output";
  filename?: string;
  showLineNumbers?: boolean;
  title?: string;
  copyable?: boolean;
}

const languageConfig: Record<string, { label: string; icon: typeof Terminal; accent: string }> = {
  bash: { label: "Terminal", icon: Terminal, accent: "green" },
  javascript: { label: "JavaScript", icon: FileCode, accent: "yellow" },
  typescript: { label: "TypeScript", icon: FileCode, accent: "blue" },
  json: { label: "JSON", icon: FileJson, accent: "orange" },
  python: { label: "Python", icon: FileCode, accent: "cyan" },
  ruby: { label: "Ruby", icon: FileCode, accent: "red" },
  text: { label: "Plain Text", icon: FileText, accent: "white" },
  output: { label: "Output", icon: Terminal, accent: "purple" },
};

// Simple syntax highlighting with rainbow-inspired colors
function highlightSyntax(code: string, language: string): React.ReactNode[] {
  const lines = code.split("\n");

  return lines.map((line, i) => {
    if (language === "output" || language === "text") {
      return <span key={i} className="text-white/70">{line}</span>;
    }

    if (language === "bash") {
      // Highlight comments
      if (line.trim().startsWith("#")) {
        return <span key={i} className="text-white/40 italic">{line}</span>;
      }
      // Highlight the command prefix ($)
      if (line.trim().startsWith("$")) {
        const [prefix, ...rest] = line.split(" ");
        return (
          <span key={i}>
            <span className="text-violet-400">{prefix}</span>
            <span className="text-emerald-400"> {rest.join(" ")}</span>
          </span>
        );
      }
      // Regular commands
      const parts = line.split(" ");
      const cmd = parts[0];
      const args = parts.slice(1).join(" ");

      // Check for flags
      const highlightedArgs = args.split(/(\s+)/).map((part, j) => {
        if (part.startsWith("--") || part.startsWith("-")) {
          return <span key={j} className="text-cyan-400">{part}</span>;
        }
        if (part.startsWith("http://") || part.startsWith("https://") || part.includes(".onion")) {
          return <span key={j} className="text-blue-400 underline decoration-blue-400/30">{part}</span>;
        }
        return <span key={j} className="text-emerald-400">{part}</span>;
      });

      return (
        <span key={i}>
          <span className="text-amber-400">{cmd}</span>
          {args && <span> </span>}
          {highlightedArgs}
        </span>
      );
    }

    if (language === "javascript" || language === "typescript") {
      // Comments
      if (line.trim().startsWith("//")) {
        return <span key={i} className="text-white/40 italic">{line}</span>;
      }

      const elements: React.ReactNode[] = [];
      let remaining = line;
      let keyIndex = 0;

      // Keywords - using rainbow colors
      const keywords = ["const", "let", "var", "function", "return", "if", "else", "import", "export", "from", "require", "async", "await", "class", "extends", "new", "this", "try", "catch", "throw", "typeof", "instanceof"];
      const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
      const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
      const numberRegex = /\b(\d+)\b/g;

      const allMatches: { type: string; start: number; end: number; value: string }[] = [];

      let match;
      stringRegex.lastIndex = 0;
      while ((match = stringRegex.exec(remaining)) !== null) {
        allMatches.push({ type: "string", start: match.index, end: match.index + match[0].length, value: match[0] });
      }

      keywordRegex.lastIndex = 0;
      while ((match = keywordRegex.exec(remaining)) !== null) {
        const inString = allMatches.some(m => match!.index >= m.start && match!.index < m.end);
        if (!inString) {
          allMatches.push({ type: "keyword", start: match.index, end: match.index + match[0].length, value: match[0] });
        }
      }

      numberRegex.lastIndex = 0;
      while ((match = numberRegex.exec(remaining)) !== null) {
        const inString = allMatches.some(m => match!.index >= m.start && match!.index < m.end);
        const inKeyword = allMatches.some(m => m.type === "keyword" && match!.index >= m.start && match!.index < m.end);
        if (!inString && !inKeyword) {
          allMatches.push({ type: "number", start: match.index, end: match.index + match[0].length, value: match[0] });
        }
      }

      allMatches.sort((a, b) => a.start - b.start);

      let pos = 0;
      allMatches.forEach((m) => {
        if (m.start > pos) {
          elements.push(<span key={`text-${keyIndex++}`} className="text-white/80">{remaining.slice(pos, m.start)}</span>);
        }
        if (m.type === "string") {
          elements.push(<span key={`str-${keyIndex++}`} className="text-emerald-400">{m.value}</span>);
        } else if (m.type === "keyword") {
          elements.push(<span key={`kw-${keyIndex++}`} className="text-violet-400">{m.value}</span>);
        } else if (m.type === "number") {
          elements.push(<span key={`num-${keyIndex++}`} className="text-amber-400">{m.value}</span>);
        }
        pos = m.end;
      });

      if (pos < remaining.length) {
        elements.push(<span key={`end-${keyIndex++}`} className="text-white/80">{remaining.slice(pos)}</span>);
      }

      return <span key={i}>{elements.length > 0 ? elements : <span className="text-white/80">{line}</span>}</span>;
    }

    if (language === "json") {
      const elements: React.ReactNode[] = [];
      let keyIndex = 0;

      const keyRegex = /"([^"]+)":/g;
      const stringRegex = /:\s*"([^"]*)"/g;

      let remaining = line;
      const matches: { type: string; start: number; end: number; value: string }[] = [];

      let match;
      keyRegex.lastIndex = 0;
      while ((match = keyRegex.exec(remaining)) !== null) {
        matches.push({ type: "key", start: match.index, end: match.index + match[0].length - 1, value: `"${match[1]}"` });
      }

      stringRegex.lastIndex = 0;
      while ((match = stringRegex.exec(remaining)) !== null) {
        const valueStart = remaining.indexOf(`"${match[1]}"`, match.index + 1);
        if (valueStart !== -1) {
          matches.push({ type: "string", start: valueStart, end: valueStart + match[1].length + 2, value: `"${match[1]}"` });
        }
      }

      matches.sort((a, b) => a.start - b.start);

      let pos = 0;
      matches.forEach((m) => {
        if (m.start > pos) {
          elements.push(<span key={`t-${keyIndex++}`} className="text-white/60">{remaining.slice(pos, m.start)}</span>);
        }
        if (m.type === "key") {
          elements.push(<span key={`k-${keyIndex++}`} className="text-cyan-400">{m.value}</span>);
        } else if (m.type === "string") {
          elements.push(<span key={`s-${keyIndex++}`} className="text-emerald-400">{m.value}</span>);
        }
        pos = m.end;
      });

      if (pos < remaining.length) {
        elements.push(<span key={`e-${keyIndex++}`} className="text-white/60">{remaining.slice(pos)}</span>);
      }

      return <span key={i}>{elements.length > 0 ? elements : <span className="text-white/60">{line}</span>}</span>;
    }

    if (language === "python") {
      if (line.trim().startsWith("#")) {
        return <span key={i} className="text-white/40 italic">{line}</span>;
      }

      const keywords = ["def", "class", "import", "from", "return", "if", "elif", "else", "for", "while", "try", "except", "with", "as", "lambda", "yield", "async", "await", "True", "False", "None"];
      let highlighted = line;

      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, "g");
        highlighted = highlighted.replace(regex, `__KW_${kw}__`);
      });

      const elements: React.ReactNode[] = [];
      const parts = highlighted.split(/(__KW_\w+__)/);

      parts.forEach((part, idx) => {
        if (part.startsWith("__KW_") && part.endsWith("__")) {
          const kw = part.slice(5, -2);
          elements.push(<span key={idx} className="text-violet-400">{kw}</span>);
        } else {
          elements.push(<span key={idx} className="text-white/80">{part}</span>);
        }
      });

      return <span key={i}>{elements}</span>;
    }

    return <span key={i} className="text-emerald-400">{line}</span>;
  });
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  showLineNumbers = false,
  title,
  copyable = true
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const config = languageConfig[language] || languageConfig.text;
  const Icon = config.icon;
  const lines = code.split("\n");
  const shouldShowLineNumbers = showLineNumbers || lines.length > 5;

  const cleanCodeForCopy = () => {
    if (language === "bash") {
      return code.split("\n").map(line => {
        if (line.trim().startsWith("$ ")) {
          return line.replace(/^\s*\$\s*/, "");
        }
        if (line.trim().startsWith("# ")) {
          return "";
        }
        return line;
      }).filter(Boolean).join("\n");
    }
    return code;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCodeForCopy());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const highlightedLines = highlightSyntax(code, language);

  return (
    <div className="group relative rounded-xl overflow-hidden bg-[#0a0a0a] my-4">
      {/* Rainbow gradient border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] rounded-xl bg-[#0a0a0a]" />

      {/* Border */}
      <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors" />

      {/* Content */}
      <div className="relative">
        {/* Compact header with rainbow accent */}
        <div className="relative">
          {/* Rainbow top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-violet-500 opacity-60" />

          <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/50">
                {filename || title || config.label}
              </span>
            </div>

            {copyable && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all"
                aria-label={copied ? "Copied" : "Copy to clipboard"}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <div className="relative overflow-x-auto">
          <pre className="p-4 text-sm font-mono leading-relaxed">
            {shouldShowLineNumbers ? (
              <div className="flex">
                {/* Line numbers with gradient */}
                <div className="select-none pr-4 text-right border-r border-white/5 mr-4">
                  {lines.map((_, i) => (
                    <div key={i} className="text-white/20 text-xs leading-relaxed tabular-nums">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code */}
                <div className="flex-1 min-w-0">
                  {highlightedLines.map((line, i) => (
                    <div key={i} className="leading-relaxed hover:bg-white/[0.02] -mx-2 px-2 rounded">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {highlightedLines.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Inline code component with rainbow hover effect
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="relative px-1.5 py-0.5 rounded-md bg-white/5 text-white/90 text-sm font-mono border border-white/10 hover:border-white/20 transition-colors">
      {children}
    </code>
  );
}

// Command component for single-line commands with quick copy
export function Command({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      onClick={handleCopy}
      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-white/10 hover:border-white/20 cursor-pointer transition-all"
    >
      <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
      <code className="text-sm font-mono text-emerald-400">{children}</code>
      <span className="text-white/30 text-xs group-hover:text-white/50 transition-colors">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </span>
    </div>
  );
}
