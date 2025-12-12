"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function GettingStartedPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Getting Started</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          This guide walks you through installing Beam, creating your first tunnel, and understanding
          the basic concepts. By the end, you'll have a working tunnel exposing your local development
          server to the internet via Tor.
        </p>
      </header>

      {/* System Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">System Requirements</h2>

        <p className="text-white/70 mb-4">
          Beam runs on macOS, Linux, and Windows (via WSL). You'll need:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">Node.js 18 or higher</strong> — Beam's CLI is written in TypeScript and runs on Node</li>
          <li><strong className="text-white/90">npm</strong> — Comes bundled with Node.js</li>
          <li><strong className="text-white/90">Tor</strong> — Optional but recommended; Beam can use an embedded Tor client or connect to an existing Tor installation</li>
        </ul>

        <p className="text-white/60 text-sm">
          To check your Node version, run <InlineCode>node --version</InlineCode> in your terminal.
          If you need to install or update Node, visit{" "}
          <a href="https://nodejs.org" className="text-white/80 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            nodejs.org
          </a>.
        </p>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Installation</h2>

        <p className="text-white/70 mb-4">
          Install Beam globally using npm:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="npm install -g @byronwade/beam"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          This installs the <InlineCode>beam</InlineCode> command
          globally. The package includes both the Node.js CLI and the compiled Rust tunnel daemon for your platform.
        </p>

        <p className="text-white/60 text-sm mb-4">
          If you prefer not to install globally, you can use npx to run Beam directly:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="npx @byronwade/beam 3000"
            language="bash"
          />
        </div>
      </section>

      {/* Creating Your First Tunnel */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Creating Your First Tunnel</h2>

        <p className="text-white/70 mb-4">
          Let's expose a local development server running on port 3000. If you don't have a server
          running, you can start a simple one with Python or Node:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="python3 -m http.server 3000"
            language="bash"
            title="Start a test server (Python)"
          />
        </div>

        <p className="text-white/70 mb-4">
          Now, in a new terminal window, create a tunnel:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Beam will start the tunnel daemon in <strong className="text-white/90">balanced mode</strong> (the default),
          connect to Tor, and generate a .onion address. This takes 10-30 seconds on first run while Tor builds circuits.
          You'll see output like:
        </p>

        <div className="mb-6">
          <CodeBlock
            code={`🚀 Starting tunnel daemon...
   Mode: balanced (Single-hop Tor for good balance of speed and privacy)

⚖️  Balanced mode tunnel active!
   Local:  http://127.0.0.1:4000 → localhost:3000
   Global: http://abc123xyz789def456.onion

   Expected latency: ~80-150ms
   Privacy: Medium (server exposed, clients hidden)
   Circuits prebuilt: 3

Press Ctrl+C to stop the tunnel`}
            language="output"
            title="Output"
            copyable={false}
          />
        </div>

        <p className="text-white/70">
          The .onion address is now accessible from any Tor-enabled browser or client. You can test it
          using the Tor Browser, or with curl through a Tor proxy.
        </p>
      </section>

      {/* Tunnel Modes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Choosing a Tunnel Mode</h2>

        <p className="text-white/70 mb-4">
          Beam offers three tunnel modes, each optimized for different use cases. Use the{" "}
          <InlineCode>--mode</InlineCode> flag to select:
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <h3 className="font-medium text-emerald-400 mb-2">⚡ Fast Mode (~30-50ms latency)</h3>
            <p className="text-white/70 text-sm mb-2">Direct P2P connection for maximum speed. Best for local network testing.</p>
            <CodeBlock code="beam 3000 --mode=fast" language="bash" />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="font-medium text-yellow-400 mb-2">⚖️ Balanced Mode (~80-150ms latency) — Default</h3>
            <p className="text-white/70 text-sm mb-2">Single-hop Tor for good speed with privacy. Server is exposed, but clients remain anonymous.</p>
            <CodeBlock code="beam 3000 --mode=balanced" language="bash" />
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h3 className="font-medium text-purple-400 mb-2">🔒 Private Mode (~200-500ms latency)</h3>
            <p className="text-white/70 text-sm mb-2">Full 3-hop Tor onion routing for maximum privacy and anonymity.</p>
            <CodeBlock code="beam 3000 --mode=private" language="bash" />
          </div>
        </div>

        <p className="text-white/60 text-sm">
          For detailed performance tuning options, see the{" "}
          <Link href="/docs/performance" className="text-white/80 underline hover:text-white">
            Performance Guide
          </Link>.
        </p>
      </section>

      {/* Custom Domains */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Using Custom Local Domains</h2>

        <p className="text-white/70 mb-4">
          Instead of using <InlineCode>localhost:3000</InlineCode>,
          you can assign a custom domain like <InlineCode>myapp.local</InlineCode>.
          This is useful when your application requires a specific hostname, or when you want cleaner URLs.
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --domain myapp.local"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Beam runs a local DNS server that resolves <InlineCode>myapp.local</InlineCode> to <InlineCode>127.0.0.1</InlineCode>.
          You may need to configure your system to use Beam's DNS server (typically running on port 5354).
        </p>

        <p className="text-white/60 text-sm">
          On macOS, Beam can automatically configure DNS resolution. On Linux, you may need to add
          Beam's DNS server to your resolver configuration manually.
        </p>
      </section>

      {/* Balanced Mode */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Balanced Mode: Speed + Privacy</h2>

        <p className="text-white/70 mb-4">
          For development, you often want both fast local access and the ability to share with others.
          The default <InlineCode>balanced</InlineCode> mode gives you both with optimized latency:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --domain myapp.local --mode=balanced"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          With balanced mode, you get:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-4">
          <li><InlineCode>http://myapp.local</InlineCode> — Fast local access with minimal latency</li>
          <li><InlineCode>http://xyz.onion</InlineCode> — Global access via single-hop Tor (~80-150ms)</li>
        </ul>

        <p className="text-white/60 text-sm">
          Note: The <InlineCode>--dual</InlineCode> flag is deprecated. Use <InlineCode>--mode=balanced</InlineCode> instead for the same functionality with better performance.
        </p>
      </section>

      {/* HTTPS */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Enabling HTTPS</h2>

        <p className="text-white/70 mb-4">
          Some applications require HTTPS, especially when testing features like service workers,
          secure cookies, or WebRTC. Beam can generate self-signed certificates automatically:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --https --domain myapp.local"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Your browser will show a certificate warning since the certificate is self-signed. You can
          safely proceed for development purposes. For production use, you'd want to use proper
          certificates.
        </p>

        <p className="text-white/60 text-sm">
          Traffic over Tor is already encrypted end-to-end by the Tor protocol, regardless of whether
          you enable HTTPS. The <InlineCode>--https</InlineCode> flag
          is primarily useful for local development requirements.
        </p>
      </section>

      {/* Verbose Mode */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Debugging with Verbose Mode</h2>

        <p className="text-white/70 mb-4">
          If something isn't working, enable verbose logging to see what's happening:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --verbose"
            language="bash"
          />
        </div>

        <p className="text-white/70">
          This shows detailed output including Tor connection status, DNS resolution, and HTTP request
          handling. Useful for diagnosing connection issues or understanding how Beam processes requests.
        </p>
      </section>

      {/* Stopping the Tunnel */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Stopping the Tunnel</h2>

        <p className="text-white/70 mb-4">
          Press <InlineCode>Ctrl+C</InlineCode> in the terminal
          where Beam is running. This gracefully shuts down the tunnel daemon and disconnects from Tor.
        </p>

        <p className="text-white/70">
          Your .onion address will become inactive immediately. The next time you start a tunnel, you'll
          get a new .onion address unless you configure persistent keys (covered in advanced usage).
        </p>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Next Steps</h2>

        <p className="text-white/70 mb-4">
          Now that you have Beam running, explore these resources to get the most out of it:
        </p>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— Complete documentation of all commands, flags, and configuration options
          </li>
          <li>
            <Link href="/docs/performance" className="text-white underline hover:text-white/80">
              Performance Guide
            </Link>
            {" "}— Optimize latency with caching, circuit prebuilding, and geographic relay selection
          </li>
          <li>
            <Link href="/docs/examples" className="text-white underline hover:text-white/80">
              Examples
            </Link>
            {" "}— Practical examples for webhook testing, API development, and team collaboration
          </li>
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— Technical details on how the CLI, daemon, and Tor integration work together
          </li>
          <li>
            <Link href="/docs/troubleshooting" className="text-white underline hover:text-white/80">
              Troubleshooting
            </Link>
            {" "}— Solutions to common issues and debugging techniques
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Having trouble? Check the{" "}
          <Link href="/docs/troubleshooting" className="text-white/70 underline hover:text-white">
            troubleshooting guide
          </Link>{" "}
          or{" "}
          <a href="https://github.com/byronwade/beam/issues" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            open an issue on GitHub
          </a>.
        </p>
      </footer>
    </article>
  );
}


