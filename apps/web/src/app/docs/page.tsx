"use client";

import Link from "next/link";
import { CodeBlock, InlineCode, Command } from "@/components/code-block";

export default function DocsPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Beam Documentation</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Beam is a private, direct-connect tunneling tool that exposes local development servers to the internet.
          Unlike centralized services like ngrok, Beam connects typically without intermediary servers—your traffic
          flows directly between the client and your machine (using UPnP/NAT-PMP), or optionally via
          Tor's onion routing for anonymity. Both modes provide end-to-end encryption by default and
          require no account or payment.
        </p>
      </header>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Start</h2>

        <p className="text-white/70 mb-4">
          Install Beam globally using npm, then start a tunnel to any local port:
        </p>

        <CodeBlock
          code={`npm install -g @byronwade/beam`}
          language="bash"
          title="Install Beam"
        />

        <CodeBlock
          code={`beam 3000`}
          language="bash"
          title="Start a tunnel"
        />

        <p className="text-white/70 mb-4">
          This checks your network for UPnP support and opens a direct, HTTPS-encrypted public connection
          (e.g., <InlineCode>https://1.2.3.4.nip.io:3000</InlineCode>). If direct access isn't possible
          or anonymity is preferred, use <InlineCode>beam start 3000</InlineCode> for Tor mode.
        </p>

        <p className="text-white/60 text-sm mb-3">
          For local development with custom domains, add the <InlineCode>--domain</InlineCode> flag:
        </p>

        <CodeBlock
          code={`beam 3000 --domain myapp.local --tor`}
          language="bash"
          title="Custom domain"
        />
      </section>

      {/* How Beam Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">How Beam Works</h2>

        <p className="text-white/70 mb-4">
          Beam consists of two components: a Node.js CLI that handles user interaction, and a Rust
          daemon that manages the actual tunneling. When you run <InlineCode>beam 3000</InlineCode>,
          the following happens:
        </p>

        <ol className="list-decimal list-inside space-y-3 text-white/70 mb-6 ml-4">
          <li>The CLI spawns the Rust tunnel daemon as a background process</li>
          <li>The daemon starts an embedded Tor client and creates a hidden service</li>
          <li>A local DNS server resolves custom domains (like <InlineCode>myapp.local</InlineCode>) to <InlineCode>127.0.0.1</InlineCode></li>
          <li>An HTTP proxy intercepts requests and forwards them to your local server</li>
          <li>Traffic from the Tor network is routed to the same local port</li>
        </ol>

        <p className="text-white/70 mb-4">
          The result is dual-access: you can reach your app via <InlineCode>http://myapp.local</InlineCode> on
          your machine, and via the <InlineCode>.onion</InlineCode> address from anywhere in the world.
        </p>
      </section>

      {/* Why Decentralized Tunneling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Why Decentralized Tunneling?</h2>

        <p className="text-white/70 mb-4">
          Traditional tunneling services route all traffic through their servers. This creates several problems:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6 ml-4">
          <li><strong className="text-white/90">Privacy:</strong> The provider can inspect, log, and analyze your traffic</li>
          <li><strong className="text-white/90">Availability:</strong> If their servers go down, your tunnels stop working</li>
          <li><strong className="text-white/90">Censorship:</strong> Governments can block the provider's domains</li>
          <li><strong className="text-white/90">Cost:</strong> Premium features require paid subscriptions</li>
        </ul>

        <p className="text-white/70 mb-4">
          Beam eliminates these concerns by using Tor as the transport layer. Your traffic never
          touches a centralized server—it flows through the distributed Tor network, encrypted at
          every hop. There's no company that can read your data, shut down your tunnel, or comply
          with takedown requests.
        </p>

        <p className="text-white/70">
          The tradeoff is latency. Tor adds approximately 200-500ms of round-trip time due to
          its multi-hop routing. For development and testing, this is usually acceptable. For
          production use cases requiring low latency, consider Beam's upcoming P2P mode.
        </p>
      </section>

      {/* Current Status */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Current Status</h2>

        <p className="text-white/70 mb-4">
          Beam is in active development. The core tunneling functionality is stable and usable:
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Working Features</h3>
          <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
            <li>HTTP/HTTPS tunneling to any local port</li>
            <li>Tor hidden service creation with persistent .onion addresses</li>
            <li>Custom local domains via built-in DNS server</li>
            <li>Dual-mode operation (local + Tor simultaneously)</li>
            <li>TLS certificate generation for HTTPS</li>
            <li>WebSocket support</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">In Development</h3>
          <ul className="list-disc list-inside space-y-1 text-white/60 ml-4">
            <li>P2P domain registry using Kademlia DHT</li>
            <li>Nym mixnet integration for enhanced privacy</li>
            <li>Veilid framework support</li>
            <li>I2P garlic routing option</li>
            <li>Multi-tunnel management</li>
            <li>Traffic analytics and request inspection</li>
          </ul>
        </div>

        <p className="text-white/60 text-sm">
          This is a solo developer project. Development pace depends on community interest and
          <Link href="https://github.com/sponsors/byronwade" className="text-white/80 underline hover:text-white ml-1">
            sponsorship support
          </Link>.
        </p>
      </section>

      {/* Use Cases */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Use Cases</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Webhook Development</h3>
            <p className="text-white/70">
              Test webhooks from services like Stripe, GitHub, or Twilio without deploying to a server.
              Create a tunnel to your local webhook handler, configure the service with your .onion URL,
              and receive real webhook payloads during development.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Mobile App Testing</h3>
            <p className="text-white/70">
              Test your mobile app against a local API server. Run your backend locally, create a tunnel,
              and point your mobile app at the .onion address. No need to deploy to staging environments
              for each change.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Team Collaboration</h3>
            <p className="text-white/70">
              Share your work-in-progress with teammates or clients. Create a tunnel to your local
              development server and send them the .onion link. They can view your changes in real-time
              without you pushing to a shared environment.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Privacy-Sensitive Development</h3>
            <p className="text-white/70">
              When working on sensitive projects, Beam ensures your development traffic remains private.
              Unlike centralized services, no third party can inspect what you're building or who's
              accessing your development server.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Next Steps</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/getting-started" className="text-white underline hover:text-white/80">
              Getting Started Guide
            </Link>
            {" "}— Detailed installation instructions and system requirements
          </li>
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— Complete documentation of all commands and options
          </li>
          <li>
            <Link href="/docs/examples" className="text-white underline hover:text-white/80">
              Examples
            </Link>
            {" "}— Practical code examples for common scenarios
          </li>
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— Technical deep-dive into how Beam works
          </li>
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— Understanding Tor integration and hidden services
          </li>
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— Understanding Tor integration and hidden services
          </li>
          <li>
            <Link href="/docs/roadmap" className="text-white underline hover:text-white/80">
              Project Roadmap
            </Link>
            {" "}— Future plans for I2P, Nym, WebRTC, and detailed expanding research
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Beam is open source software licensed under AGPLv3. View the source code and contribute on{" "}
          <Link href="https://github.com/byronwade/beam" className="text-white/70 underline hover:text-white">
            GitHub
          </Link>.
        </p>
      </footer>
    </article>
  );
}


