"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function CLIReferencePage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">CLI Reference</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Complete reference for the Beam command-line interface. This page documents all available
          commands, options, and configuration settings.
        </p>
      </header>

      {/* Basic Usage */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Basic Usage</h2>

        <p className="text-white/70 mb-4">
          The simplest way to use Beam is to specify a port number:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam <port>"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          This checks for UPnP support on your router and opens a direct, encrypted connection associated
          with your public IP (using a <InlineCode>.nip.io</InlineCode> domain). This is the fastest and
          most reliable mode, adding zero latency.
        </p>
      </section>

      {/* beam <port> */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">beam &lt;port&gt;</h2>

        <p className="text-white/70 mb-4">
          Start a Direct Internet Mode tunnel. This exposes your local port directly to the internet
          using UPnP/NAT-PMP and automates SSL generation (Green Lock).
        </p>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">Behavior</h3>
        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6 ml-4">
          <li>Auto-detects Public IP</li>
          <li>Requests port mapping from router (UPnP)</li>
          <li>Generates Trusted SSL Certificate (requires one-time sudo)</li>
          <li>Provides a public <InlineCode>https://x.x.x.x.nip.io:port</InlineCode> URL</li>
        </ul>

        {/* beam tunnel <port> */}
        <h2 className="text-2xl font-semibold text-white mb-4 mt-12">beam tunnel &lt;port&gt;</h2>

        <p className="text-white/70 mb-4">
          Start an Anonymous Tunnel (Tor). Use this if you are behind a strict firewall that blocks UPnP,
          or if you need to hide your IP address.
        </p>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">Tunnel Options</h3>

        <div className="space-y-6">
          {/* --mode */}
          <div className="border-l-2 border-green-500/50 pl-4 bg-green-500/5 py-3 -ml-4 pl-8">
            <h4 className="font-mono text-white mb-2">--mode &lt;mode&gt;, -m</h4>
            <p className="text-white/70 text-sm mb-2">
              Select the anonymity mode (Applies to <InlineCode>beam tunnel</InlineCode> only).
              <strong className="text-white"> Default: balanced</strong>
            </p>
            <div className="space-y-2 my-4">
              <div className="flex items-start gap-3 text-sm">
                <code className="text-green-400 font-mono">fast</code>
                <span className="text-white/60">~50ms+, P2P assisted</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <code className="text-yellow-400 font-mono">balanced</code>
                <span className="text-white/60">~150ms+, Single-hop Tor</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <code className="text-purple-400 font-mono">private</code>
                <span className="text-white/60">~500ms+, Full 3-hop Tor (Hidden Service)</span>
              </div>
            </div>
          </div>

          {/* --domain */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--domain &lt;name&gt;, -d</h4>
            <p className="text-white/70 text-sm mb-2">
              Set a custom local domain name or .onion label.
            </p>
            <CodeBlock
              code="beam tunnel 3000 --domain myapp"
              language="bash"
            />
          </div>

          {/* --https */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--https (Limited)</h4>
            <p className="text-white/70 text-sm mb-2">
              For Tor connections, HTTPS is handled by the onion protocol itself (end-to-end encryption).
              This flag primarily affects the local proxy interface.
            </p>
          </div>

          {/* --https-port */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--https-port &lt;port&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Specify the port for the HTTPS server. Defaults to 443 if running with elevated
              privileges, otherwise 8443.
            </p>
            <CodeBlock
              code="beam 3000 --https --https-port 9443"
              language="bash"
            />
          </div>

          {/* --dns-port */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--dns-port &lt;port&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Port for the local DNS server. Defaults to 5354. You may need to configure your
              system's resolver to use this port for .local domains.
            </p>
            <CodeBlock
              code="beam 3000 --domain myapp.local --dns-port 5353"
              language="bash"
            />
          </div>

          {/* --tor-port */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--tor-port &lt;port&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Port for the Tor SOCKS proxy. Defaults to 9050. Change this if you have an existing
              Tor installation using that port.
            </p>
            <CodeBlock
              code="beam 3000 --tor --tor-port 9150"
              language="bash"
            />
          </div>

          {/* --verbose */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--verbose, -v</h4>
            <p className="text-white/70 text-sm mb-2">
              Enable verbose logging. Shows detailed information about Tor connection status,
              DNS queries, HTTP requests, and internal state changes.
            </p>
            <CodeBlock
              code="beam 3000 --verbose"
              language="bash"
            />
            <p className="text-white/60 text-xs mt-2">
              Useful for debugging connection issues or understanding Beam's behavior.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-3 mt-8">Performance Options</h3>

        <div className="space-y-6">
          {/* --cache / --no-cache */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--no-cache</h4>
            <p className="text-white/70 text-sm mb-2">
              Disable response caching. By default, Beam caches static assets (JS, CSS, images, fonts)
              to reduce round-trips, especially helpful in Tor modes.
            </p>
            <CodeBlock
              code="beam 3000 --no-cache"
              language="bash"
            />
          </div>

          {/* --cache-size */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--cache-size &lt;mb&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Set the maximum cache size in megabytes. Default: 100MB.
            </p>
            <CodeBlock
              code="beam 3000 --cache-size=200"
              language="bash"
            />
          </div>

          {/* --cache-ttl */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--cache-ttl &lt;seconds&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Set the cache time-to-live in seconds. Default: 300 (5 minutes).
            </p>
            <CodeBlock
              code="beam 3000 --cache-ttl=600"
              language="bash"
            />
          </div>

          {/* --geo-prefer */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--geo-prefer &lt;countries&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Specify preferred countries for Tor relay selection using ISO 3166-1 alpha-2 codes.
              Reduces latency by selecting geographically closer relays.
            </p>
            <CodeBlock
              code="beam 3000 --mode=balanced --geo-prefer=US,CA,MX"
              language="bash"
            />
            <p className="text-white/60 text-xs mt-2">
              <strong className="text-orange-400">Warning:</strong> Not recommended for private mode as it reduces anonymity.
            </p>
          </div>

          {/* --prebuild-circuits */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--prebuild-circuits &lt;count&gt;</h4>
            <p className="text-white/70 text-sm mb-2">
              Number of Tor circuits to prebuild for faster initial connections. Default: 3.
            </p>
            <CodeBlock
              code="beam 3000 --prebuild-circuits=5"
              language="bash"
            />
          </div>

          {/* --no-prebuild */}
          <div className="border-l-2 border-white/20 pl-4">
            <h4 className="font-mono text-white mb-2">--no-prebuild</h4>
            <p className="text-white/70 text-sm mb-2">
              Disable circuit prebuilding. Saves resources but increases latency on first connection.
            </p>
            <CodeBlock
              code="beam 3000 --no-prebuild"
              language="bash"
            />
          </div>
        </div>
      </section>

      {/* beam start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">beam start &lt;port&gt;</h2>

        <p className="text-white/70 mb-4">
          Explicit form of the default command. Identical to <InlineCode>beam &lt;port&gt;</InlineCode>.
          Use this when you want to be explicit about starting a tunnel.
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam start 3000 --domain myapp.local --mode=balanced"
            language="bash"
          />
        </div>

        <p className="text-white/60 text-sm">
          Accepts all the same options as the default port command.
        </p>
      </section>

      {/* Planned Commands */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Planned Commands</h2>

        <p className="text-white/70 mb-4">
          The following commands are planned for future releases as part of the P2P networking
          and advanced management features:
        </p>

        <div className="space-y-4">
          <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <h3 className="font-mono text-white/60 mb-2">beam register &lt;domain&gt;</h3>
            <p className="text-white/50 text-sm">
              Register a domain in the P2P network's distributed hash table. Will allow persistent,
              human-readable names that resolve across the Beam network.
            </p>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <h3 className="font-mono text-white/60 mb-2">beam list</h3>
            <p className="text-white/50 text-sm">
              List all active tunnels. Will show tunnel status, addresses, and traffic statistics.
            </p>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <h3 className="font-mono text-white/60 mb-2">beam stop &lt;name&gt;</h3>
            <p className="text-white/50 text-sm">
              Stop a specific tunnel by name or ID. Currently, tunnels are stopped with Ctrl+C.
            </p>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <h3 className="font-mono text-white/60 mb-2">beam status</h3>
            <p className="text-white/50 text-sm">
              Show comprehensive system status including Tor connectivity, P2P network health,
              and active tunnel information.
            </p>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <h3 className="font-mono text-white/60 mb-2">beam config</h3>
            <p className="text-white/50 text-sm">
              Manage Beam configuration. Will support setting defaults, viewing current config,
              and managing persistent settings.
            </p>
          </div>
        </div>
      </section>

      {/* Configuration Files */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Configuration Files</h2>

        <p className="text-white/70 mb-4">
          Beam stores configuration and data in the <InlineCode>~/.beam/</InlineCode> directory:
        </p>

        <ul className="space-y-3 text-white/70 ml-4">
          <li>
            <InlineCode>~/.beam/certs/</InlineCode>
            <p className="text-white/60 text-sm mt-1">Generated TLS certificates for HTTPS mode</p>
          </li>
          <li>
            <InlineCode>~/.beam/tor/</InlineCode>
            <p className="text-white/60 text-sm mt-1">Tor data directory including hidden service keys</p>
          </li>
          <li>
            <InlineCode>~/.beam/cache/</InlineCode>
            <p className="text-white/60 text-sm mt-1">Response cache for static assets (when caching enabled)</p>
          </li>
        </ul>
      </section>

      {/* Environment Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Environment Variables</h2>

        <p className="text-white/70 mb-4">
          Beam recognizes the following environment variables:
        </p>

        <ul className="space-y-3 text-white/70 ml-4">
          <li>
            <InlineCode>BEAM_MODE</InlineCode>
            <p className="text-white/60 text-sm mt-1">Default tunnel mode: "fast", "balanced", or "private" (default: balanced)</p>
          </li>
          <li>
            <InlineCode>BEAM_TOR_SOCKS_PORT</InlineCode>
            <p className="text-white/60 text-sm mt-1">Override the default Tor SOCKS port (default: 9050)</p>
          </li>
          <li>
            <InlineCode>BEAM_DNS_PORT</InlineCode>
            <p className="text-white/60 text-sm mt-1">Override the default DNS server port (default: 5354)</p>
          </li>
          <li>
            <InlineCode>BEAM_CACHE_SIZE</InlineCode>
            <p className="text-white/60 text-sm mt-1">Default cache size in MB (default: 100)</p>
          </li>
          <li>
            <InlineCode>BEAM_CACHE_TTL</InlineCode>
            <p className="text-white/60 text-sm mt-1">Default cache TTL in seconds (default: 300)</p>
          </li>
          <li>
            <InlineCode>BEAM_PREBUILD_CIRCUITS</InlineCode>
            <p className="text-white/60 text-sm mt-1">Number of circuits to prebuild (default: 3)</p>
          </li>
          <li>
            <InlineCode>BEAM_GEO_PREFER</InlineCode>
            <p className="text-white/60 text-sm mt-1">Comma-separated ISO country codes for relay preference</p>
          </li>
          <li>
            <InlineCode>BEAM_VERBOSE</InlineCode>
            <p className="text-white/60 text-sm mt-1">Set to "1" or "true" to enable verbose logging by default</p>
          </li>
          <li>
            <InlineCode>RUST_LOG</InlineCode>
            <p className="text-white/60 text-sm mt-1">Control Rust daemon logging level (debug, info, warn, error)</p>
          </li>
        </ul>
      </section>

      {/* Exit Codes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Exit Codes</h2>

        <p className="text-white/70 mb-4">
          Beam uses standard exit codes:
        </p>

        <ul className="space-y-2 text-white/70 ml-4">
          <li><InlineCode>0</InlineCode> — Success (tunnel stopped gracefully)</li>
          <li><InlineCode>1</InlineCode> — General error</li>
          <li><InlineCode>2</InlineCode> — Invalid arguments</li>
          <li><InlineCode>130</InlineCode> — Interrupted (Ctrl+C)</li>
        </ul>
      </section>

      {/* Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Examples</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-white mb-2">Basic (Direct Internet Mode)</h3>
            <CodeBlock
              code="beam 3000"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Exposes localhost:3000 directly via UPnP with Trusted SSL (Green Lock). Fastest option.</p>
          </div>

          <div>
            <h3 className="text-white mb-2">Private Tunnel (Maximum Anonymity)</h3>
            <CodeBlock
              code="beam tunnel 3000 --mode=private"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Full 3-hop Tor onion routing with ~500ms latency. Hides your IP.</p>
          </div>

          <div>
            <h3 className="text-white mb-2">Balanced Tunnel (Webhook Dev)</h3>
            <CodeBlock
              code="beam tunnel 3000 --mode=balanced"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Single-hop Tor with ~150ms latency. Good for testing heavy payloads anonymously.</p>
          </div>

          <div>
            <h3 className="text-white mb-2">Fast P2P Tunnel</h3>
            <CodeBlock
              code="beam tunnel 3000 --mode=fast"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Direct P2P connection (~50ms) but requires specific network conditions.</p>
          </div>

          <div>
            <h3 className="text-white mb-2">Optimized Tunnel (with Caching)</h3>
            <CodeBlock
              code="beam tunnel 3000 --mode=balanced --cache-size=200 --prebuild-circuits=5"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Larger cache and more prebuilt circuits for better performance.</p>
          </div>

          <div>
            <h3 className="text-white mb-2">Geographic Tunnel Optimization</h3>
            <CodeBlock
              code="beam tunnel 3000 --mode=balanced --geo-prefer=US,CA,UK"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Prefer relays in US, Canada, and UK for lower latency.</p>
          </div>

          <div>
            <h3 className="text-white mb-2">Real-time data (no caching)</h3>
            <CodeBlock
              code="beam tunnel 3000 --mode=balanced --no-cache"
              language="bash"
            />
            <p className="text-white/60 text-sm mt-2">Disable caching for real-time or frequently changing data</p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">See Also</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/getting-started" className="text-white underline hover:text-white/80">
              Getting Started
            </Link>
            {" "}— Step-by-step guide to your first tunnel
          </li>
          <li>
            <Link href="/docs/performance" className="text-white underline hover:text-white/80">
              Performance Guide
            </Link>
            {" "}— Optimize latency with modes, caching, and circuit prebuilding
          </li>
          <li>
            <Link href="/docs/examples" className="text-white underline hover:text-white/80">
              Examples
            </Link>
            {" "}— Real-world usage patterns and workflows
          </li>
          <li>
            <Link href="/docs/troubleshooting" className="text-white underline hover:text-white/80">
              Troubleshooting
            </Link>
            {" "}— Common issues and solutions
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Found an error in the documentation?{" "}
          <a href="https://github.com/byronwade/beam/issues" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            Open an issue on GitHub
          </a>.
        </p>
      </footer>
    </article>
  );
}


