"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function ArchitecturePage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Architecture</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Beam uses a hybrid architecture that separates user interface from core tunneling logic.
          A Node.js CLI handles command parsing and process management, while a Rust daemon performs
          the actual network operations. This design provides both developer ergonomics and high performance.
        </p>
      </header>

      {/* System Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">System Overview</h2>

        <p className="text-white/70 mb-4">
          When you run <InlineCode>beam 3000</InlineCode>,
          several components work together:
        </p>

        {/* Visual Architecture Diagram */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6">
          <h3 className="text-center text-white/60 text-sm font-medium mb-6">Beam Architecture</h3>

          {/* Top Row - Main Components */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* CLI Tool */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">CLI Tool</div>
              <div className="text-white/50 text-xs">(Node.js)</div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-purple-500/50"></div>
            </div>

            {/* Tunnel Daemon */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">Tunnel Daemon</div>
              <div className="text-white/50 text-xs">(Rust)</div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500/50 to-green-500/50"></div>
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-green-500/50"></div>
            </div>

            {/* Tor Service */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">Tor Service</div>
              <div className="text-white/50 text-xs">(.onion)</div>
            </div>
          </div>

          {/* Vertical Connection from Tunnel Daemon */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center" style={{ marginLeft: '0px' }}>
              <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-yellow-500/50"></div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-500/50"></div>
            </div>
          </div>

          {/* Local DNS Server */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">Local DNS</div>
              <div className="text-white/50 text-xs">Server</div>
            </div>
          </div>

          {/* Vertical Arrow */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-yellow-500/50 to-orange-500/50"></div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500/50"></div>
            </div>
          </div>

          {/* Your App */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">Your App</div>
              <div className="text-white/50 text-xs">(Port 3000)</div>
            </div>
          </div>
        </div>

        <p className="text-white/70">
          The CLI spawns the daemon as a child process, communicates via stdout/stderr, and handles
          user interaction. The daemon manages all network operations including Tor connections,
          DNS resolution, and HTTP proxying.
        </p>
      </section>

      {/* CLI Tool */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">CLI Tool (Node.js)</h2>

        <p className="text-white/70 mb-4">
          The CLI is written in TypeScript and distributed via npm. It serves as the user-facing
          interface to Beam, handling argument parsing, configuration management, and process lifecycle.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Argument parsing:</strong> Validates and processes CLI flags like <InlineCode>--port</InlineCode>, <InlineCode>--domain</InlineCode>, <InlineCode>--tor</InlineCode></li>
            <li><strong className="text-white/90">Process management:</strong> Spawns the Rust daemon and monitors its health</li>
            <li><strong className="text-white/90">Configuration:</strong> Reads and writes <InlineCode>~/.beam/config.json</InlineCode></li>
            <li><strong className="text-white/90">Status display:</strong> Shows tunnel URLs, connection status, and errors</li>
            <li><strong className="text-white/90">Signal handling:</strong> Graceful shutdown on Ctrl+C</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Technology Stack</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Runtime:</strong> Node.js 18+ with ES modules</li>
            <li><strong className="text-white/90">Language:</strong> TypeScript for type safety</li>
            <li><strong className="text-white/90">Build:</strong> tsup for bundling to CJS and ESM</li>
            <li><strong className="text-white/90">Distribution:</strong> npm package <InlineCode>@byronwade/beam</InlineCode></li>
          </ul>
        </div>

        <p className="text-white/60 text-sm">
          The CLI is intentionally lightweight. All heavy lifting happens in the Rust daemon,
          keeping the Node.js process responsive to user input.
        </p>
      </section>

      {/* Tunnel Daemon */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Tunnel Daemon (Rust)</h2>

        <p className="text-white/70 mb-4">
          The daemon is compiled to a native binary for each platform (macOS, Linux, Windows).
          It handles all performance-critical networking operations using Rust's async runtime.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">HTTP/HTTPS proxy:</strong> Accepts incoming requests and forwards them to your local server</li>
            <li><strong className="text-white/90">Tor integration:</strong> Creates and maintains hidden service connections</li>
            <li><strong className="text-white/90">DNS server:</strong> Resolves custom domains like <InlineCode>myapp.local</InlineCode> to 127.0.0.1</li>
            <li><strong className="text-white/90">TLS termination:</strong> Generates self-signed certificates for HTTPS</li>
            <li><strong className="text-white/90">WebSocket support:</strong> Proxies WebSocket connections through the tunnel</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Technology Stack</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Language:</strong> Rust for memory safety and performance</li>
            <li><strong className="text-white/90">Async runtime:</strong> Tokio for non-blocking I/O</li>
            <li><strong className="text-white/90">HTTP server:</strong> Hyper for high-performance HTTP handling</li>
            <li><strong className="text-white/90">TLS:</strong> rustls for pure-Rust TLS implementation</li>
            <li><strong className="text-white/90">Tor:</strong> arti-client for Tor protocol implementation</li>
          </ul>
        </div>

        <p className="text-white/70 mb-4">
          Rust was chosen for the daemon because tunneling is inherently I/O-bound. Tokio's async
          model handles thousands of concurrent connections efficiently without the overhead of
          garbage collection pauses or thread-per-connection models.
        </p>

        <p className="text-white/60 text-sm">
          The daemon binary is bundled with the npm package. When you install Beam, it includes
          pre-compiled binaries for your platform. No Rust toolchain is required on user machines.
        </p>
      </section>

      {/* Tor Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Tor Integration</h2>

        <p className="text-white/70 mb-4">
          Beam uses the Tor network to provide global access without exposing your IP address.
          When you enable Tor mode, the daemon creates a hidden service (onion service) that
          routes traffic through the Tor network.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">How It Works</h3>
          <ol className="list-decimal list-inside space-y-3 text-white/70 ml-4">
            <li>The daemon starts an embedded Tor client using the arti library</li>
            <li>It generates an Ed25519 keypair that determines your .onion address</li>
            <li>A hidden service descriptor is published to the Tor distributed hash table</li>
            <li>Introduction points are established in the Tor network</li>
            <li>Clients connect through rendezvous points without learning your IP</li>
          </ol>
        </div>

        <p className="text-white/70 mb-4">
          The .onion address is derived from your public key, providing cryptographic identity
          verification. Anyone connecting to your .onion address can be certain they're reaching
          your service and not an impostor.
        </p>

        <p className="text-white/60 text-sm">
          Initial Tor connection takes 10-30 seconds while circuits are built. Subsequent
          requests have 100-300ms additional latency due to the multi-hop routing. This tradeoff
          provides strong privacy guarantees in exchange for some speed.
        </p>
      </section>

      {/* Local DNS */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Local DNS Resolution</h2>

        <p className="text-white/70 mb-4">
          Beam runs a lightweight DNS server that resolves custom domains to localhost. This
          allows you to use memorable domain names instead of <InlineCode>localhost:3000</InlineCode>.
        </p>

        <div className="mb-4">
          <CodeBlock code="beam 3000 --domain myapp.local" language="bash" />
        </div>

        <p className="text-white/70 mb-4">
          When you specify a domain, the DNS server binds to port 5354 (configurable) and responds
          to queries for that domain with <InlineCode>127.0.0.1</InlineCode>.
          Your system's resolver needs to be configured to use Beam's DNS server for local domains.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Platform-Specific Configuration</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">macOS:</strong> Beam can automatically create <InlineCode>/etc/resolver/local</InlineCode> files</li>
            <li><strong className="text-white/90">Linux:</strong> Requires manual configuration of systemd-resolved or dnsmasq</li>
            <li><strong className="text-white/90">Windows:</strong> Requires hosts file entry or DNS proxy configuration</li>
          </ul>
        </div>

        <p className="text-white/60 text-sm">
          The DNS server only responds to queries for domains you've configured. All other
          queries are passed through to your system's default resolver.
        </p>
      </section>

      {/* Dual Mode */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Dual-Mode Operation</h2>

        <p className="text-white/70 mb-4">
          Beam supports running local and Tor access simultaneously. This is useful during
          development when you need fast local access for yourself but also want to share
          with teammates or test webhooks.
        </p>

        <div className="mb-4">
          <CodeBlock code="beam 3000 --domain myapp.local --dual" language="bash" />
        </div>

        {/* Dual-Mode Operation Visual Diagram */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6">
          <h3 className="text-center text-white/60 text-sm font-medium mb-6">Dual-Mode Operation</h3>

          {/* Two Columns - Local and Global Access */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Local Access Column */}
            <div className="flex flex-col items-center">
              <div className="text-blue-400 font-medium text-sm mb-4 pb-2 border-b border-blue-400/30 w-full text-center">LOCAL ACCESS</div>

              {/* Browser */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center mb-3 min-w-[100px]">
                <div className="text-white font-medium text-xs">Browser</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-0.5 h-4 bg-blue-500/50"></div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-blue-500/50"></div>
              </div>

              {/* myapp.local */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-3 text-center mb-3 min-w-[100px]">
                <div className="text-white font-medium text-xs">myapp.local</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-0.5 h-4 bg-cyan-500/50"></div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-cyan-500/50"></div>
              </div>

              {/* Local DNS */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-white font-medium text-xs">Local DNS</div>
                <div className="text-white/40 text-[10px]">127.0.0.1</div>
              </div>
            </div>

            {/* Global Access Column */}
            <div className="flex flex-col items-center">
              <div className="text-green-400 font-medium text-sm mb-4 pb-2 border-b border-green-400/30 w-full text-center">GLOBAL ACCESS</div>

              {/* Tor Browser */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center mb-3 min-w-[100px]">
                <div className="text-white font-medium text-xs">Tor Browser</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-0.5 h-4 bg-purple-500/50"></div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-purple-500/50"></div>
              </div>

              {/* xyz.onion */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center mb-3 min-w-[100px]">
                <div className="text-white font-medium text-xs">xyz.onion</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-0.5 h-4 bg-green-500/50"></div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-green-500/50"></div>
              </div>

              {/* Tor Network */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-white font-medium text-xs">Tor Network</div>
                <div className="text-white/40 text-[10px]">(3 hops)</div>
              </div>
            </div>
          </div>

          {/* Converging Lines */}
          <div className="flex justify-center mb-4">
            <div className="relative w-64 h-8">
              {/* Left line going right-down */}
              <div className="absolute left-8 top-0 w-24 h-0.5 bg-gradient-to-r from-yellow-500/50 to-purple-500/30 transform rotate-[20deg] origin-left"></div>
              {/* Right line going left-down */}
              <div className="absolute right-8 top-0 w-24 h-0.5 bg-gradient-to-l from-emerald-500/50 to-purple-500/30 transform -rotate-[20deg] origin-right"></div>
            </div>
          </div>

          {/* Arrow down to Tunnel Daemon */}
          <div className="flex justify-center mb-3">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-purple-500/50"></div>
          </div>

          {/* Tunnel Daemon */}
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">Tunnel Daemon</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-3">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500/50 to-orange-500/50"></div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500/50"></div>
            </div>
          </div>

          {/* Your App */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-3 text-center min-w-[120px]">
              <div className="text-white font-medium text-sm">Your App</div>
              <div className="text-white/50 text-xs">(Port 3000)</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Local Mode Benefits</h3>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Zero additional latency</li>
              <li>Works offline</li>
              <li>Custom domain names</li>
              <li>No Tor setup required</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Tor Mode Benefits</h3>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Global accessibility</li>
              <li>IP anonymization</li>
              <li>End-to-end encryption</li>
              <li>Works through firewalls</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Request Flow</h2>

        <p className="text-white/70 mb-4">
          Understanding how requests flow through Beam helps with debugging and optimization.
          Here's what happens when a request arrives:
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Local Request</h3>
          <ol className="list-decimal list-inside space-y-2 text-white/70 ml-4">
            <li>Browser requests <InlineCode>http://myapp.local</InlineCode></li>
            <li>System resolver queries Beam's DNS server on port 5354</li>
            <li>DNS server returns <InlineCode>127.0.0.1</InlineCode></li>
            <li>Browser connects to Beam's HTTP proxy</li>
            <li>Proxy forwards request to your app on port 3000</li>
            <li>Response flows back through the same path</li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Tor Request</h3>
          <ol className="list-decimal list-inside space-y-2 text-white/70 ml-4">
            <li>Client connects to your .onion address via Tor</li>
            <li>Traffic is encrypted and routed through 3 Tor relays</li>
            <li>Traffic reaches Beam's hidden service endpoint</li>
            <li>Daemon decrypts and forwards to your app on port 3000</li>
            <li>Response is encrypted and sent back through Tor</li>
          </ol>
        </div>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Security Architecture</h2>

        <p className="text-white/70 mb-4">
          Beam implements a zero-trust security model. Key security properties include:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">No central server:</strong> Traffic never passes through Beam-operated infrastructure</li>
          <li><strong className="text-white/90">End-to-end encryption:</strong> TLS 1.3 for local HTTPS, Tor encryption for remote access</li>
          <li><strong className="text-white/90">No data collection:</strong> Beam doesn't log requests, store analytics, or phone home</li>
          <li><strong className="text-white/90">Local key storage:</strong> Cryptographic keys stored in <InlineCode>~/.beam/</InlineCode> with filesystem permissions</li>
          <li><strong className="text-white/90">Perfect forward secrecy:</strong> Session keys are ephemeral; past traffic can't be decrypted if keys are later compromised</li>
        </ul>

        <p className="text-white/60 text-sm">
          For a deeper dive into Beam's security model, see the{" "}
          <Link href="/docs/security" className="text-white/80 underline hover:text-white">Security documentation</Link>.
        </p>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Related Documentation</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— Detailed explanation of how Beam uses Tor hidden services
          </li>
          <li>
            <Link href="/docs/security" className="text-white underline hover:text-white/80">
              Security Model
            </Link>
            {" "}— Encryption, privacy, and threat model
          </li>
          <li>
            <Link href="/docs/p2p-networking" className="text-white underline hover:text-white/80">
              P2P Networking
            </Link>
            {" "}— Upcoming decentralized discovery system
          </li>
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— Complete command and flag documentation
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Have questions about the architecture? Check the{" "}
          <Link href="/docs/troubleshooting" className="text-white/70 underline hover:text-white">
            troubleshooting guide
          </Link>{" "}
          or{" "}
          <a href="https://github.com/byronwade/beam/discussions" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            start a discussion on GitHub
          </a>.
        </p>
      </footer>
    </article>
  );
}
