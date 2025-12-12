"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function TorNetworkPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Tor Network</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Beam uses the Tor network to provide global access to your local development server.
          This page explains how Tor works, how Beam integrates with it, and what security
          guarantees you get from using Tor-based tunneling.
        </p>
      </header>

      {/* What is Tor */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">What is Tor?</h2>

        <p className="text-white/70 mb-4">
          Tor (The Onion Router) is a decentralized network of volunteer-operated servers that
          enables anonymous communication. Originally developed by the U.S. Naval Research Laboratory,
          Tor is now maintained by the non-profit Tor Project and used by millions of people worldwide.
        </p>

        <p className="text-white/70 mb-4">
          The network consists of approximately 7,000 relay nodes spread across the globe. When you
          send traffic through Tor, it's encrypted in multiple layers (like an onion) and routed
          through three randomly selected relays. Each relay only knows the previous and next hop,
          never the full path—so no single point can see both where traffic came from and where
          it's going.
        </p>

        <p className="text-white/70">
          Tor has been battle-tested for over 20 years and is trusted by journalists, activists,
          researchers, and security professionals. It's one of the most studied anonymity networks
          in existence.
        </p>
      </section>

      {/* How Tor Routing Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">How Tor Routing Works</h2>

        <p className="text-white/70 mb-4">
          Tor uses onion routing, where each layer of encryption is peeled off by successive relays.
          Here's how a typical connection flows:
        </p>

        {/* Tor Onion Routing Visual Diagram */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6 overflow-x-auto">
          <h3 className="text-center text-white/60 text-sm font-medium mb-6">Tor Onion Routing</h3>

          {/* Horizontal Flow Diagram */}
          <div className="flex items-center justify-center gap-3 min-w-[700px]">
            {/* Your Request */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center min-w-[90px]">
                <div className="text-white font-medium text-sm">Your</div>
                <div className="text-white font-medium text-sm">Request</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-blue-500/50"></div>
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-blue-500/50"></div>
            </div>

            {/* Guard Relay */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-3 text-center min-w-[90px]">
                <div className="text-white font-medium text-sm">Guard</div>
                <div className="text-red-400/70 text-[10px] mt-1">Layer 3</div>
              </div>
              <div className="text-white/40 text-[9px] mt-2 text-center max-w-[90px]">
                Knows your IP
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="text-white/40 text-[8px] mb-1">Encrypted</div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-red-500/50 to-yellow-500/50"></div>
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-yellow-500/50"></div>
              </div>
            </div>

            {/* Middle Relay */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 text-center min-w-[90px]">
                <div className="text-white font-medium text-sm">Middle</div>
                <div className="text-yellow-400/70 text-[10px] mt-1">Layer 2</div>
              </div>
              <div className="text-white/40 text-[9px] mt-2 text-center max-w-[90px]">
                Knows nothing
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="text-white/40 text-[8px] mb-1">Encrypted</div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-yellow-500/50 to-green-500/50"></div>
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-green-500/50"></div>
              </div>
            </div>

            {/* Exit/Rendezvous Relay */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center min-w-[90px]">
                <div className="text-white font-medium text-sm">Exit</div>
                <div className="text-green-400/70 text-[10px] mt-1">Layer 1</div>
              </div>
              <div className="text-white/40 text-[9px] mt-2 text-center max-w-[90px]">
                Knows destination
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-green-500/50"></div>
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-purple-500/50"></div>
            </div>

            {/* Hidden Service (Beam) */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center min-w-[90px]">
                <div className="text-white font-medium text-sm">Hidden</div>
                <div className="text-white font-medium text-sm">Service</div>
                <div className="text-purple-400/70 text-[10px] mt-1">(Beam)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">The Three Relay Types</h3>
          <ul className="list-disc list-inside space-y-3 text-white/70 ml-4">
            <li>
              <strong className="text-white/90">Guard Relay:</strong> The first hop that knows your IP address.
              Selected from high-uptime, trusted relays. Your guard stays the same for weeks to prevent
              certain attacks.
            </li>
            <li>
              <strong className="text-white/90">Middle Relay:</strong> The intermediate hop that knows neither
              source nor destination. Adds an extra layer of anonymity and makes traffic analysis harder.
            </li>
            <li>
              <strong className="text-white/90">Exit/Rendezvous:</strong> For hidden services, a rendezvous point
              where client and server meet without either knowing the other's IP address.
            </li>
          </ul>
        </div>

        <p className="text-white/60 text-sm">
          Each relay can only decrypt one layer of encryption, revealing only the next hop. This
          design ensures that compromising any single relay doesn't compromise the entire circuit.
        </p>
      </section>

      {/* Hidden Services */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Hidden Services (.onion)</h2>

        <p className="text-white/70 mb-4">
          Hidden services (also called onion services) are a special Tor feature that allows you to
          host services without revealing your IP address. Unlike regular Tor usage where traffic
          eventually exits to the public internet, hidden services keep all communication entirely
          within the Tor network.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Key Properties</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Your server's IP address remains completely hidden from clients</li>
            <li>Client IP addresses are hidden from your server</li>
            <li>End-to-end encryption is automatic—no TLS certificates needed</li>
            <li>Works behind any NAT or firewall without port forwarding</li>
            <li>The .onion address is derived from your public key, providing cryptographic identity</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">.onion Address Format</h3>
          <p className="text-white/70 mb-3">
            Version 3 onion addresses are 56 characters long, derived from an Ed25519 public key:
          </p>
          <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-4">
            <code className="text-sm font-mono text-white/60 break-all">
              abc123def456ghi789jkl012mno345pqr678stu901vwx234yz.onion
            </code>
          </div>
          <p className="text-white/60 text-sm mt-3">
            The address itself is a cryptographic commitment to your public key. Anyone connecting
            to your .onion address can verify they're reaching the legitimate service and not an
            impostor—even without a certificate authority.
          </p>
        </div>
      </section>

      {/* How Beam Creates Hidden Services */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">How Beam Creates Hidden Services</h2>

        <p className="text-white/70 mb-4">
          When you run <InlineCode>beam 3000 --tor</InlineCode>,
          the daemon performs several steps to set up your hidden service:
        </p>

        <ol className="list-decimal list-inside space-y-4 text-white/70 ml-4 mb-6">
          <li>
            <strong className="text-white/90">Key Generation:</strong> Beam generates a unique Ed25519 keypair
            for your service. The public key determines your .onion address. Keys are stored in
            <InlineCode>~/.beam/keys/</InlineCode> so you get the
            same address on subsequent runs.
          </li>
          <li>
            <strong className="text-white/90">Circuit Building:</strong> The daemon connects to the Tor network
            and builds circuits to multiple introduction points—relays that will accept initial
            contact from clients.
          </li>
          <li>
            <strong className="text-white/90">Descriptor Publication:</strong> Your service descriptor is
            encrypted and published to the Tor distributed hash table (DHT). This allows clients
            to discover your introduction points by looking up your .onion address.
          </li>
          <li>
            <strong className="text-white/90">Rendezvous Protocol:</strong> When a client connects, both
            parties independently build circuits to a rendezvous point. They meet there without
            either learning the other's IP address.
          </li>
          <li>
            <strong className="text-white/90">Traffic Forwarding:</strong> Once the rendezvous is established,
            HTTP traffic flows through the circuits to Beam, which forwards it to your local server.
          </li>
        </ol>

        <p className="text-white/60 text-sm">
          The entire setup process takes 10-30 seconds on first run while Tor builds circuits.
          Subsequent connections reuse existing circuits and are much faster.
        </p>
      </section>

      {/* Using Tor with Beam */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Using Tor with Beam</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Basic Tor Tunnel</h3>
            <CodeBlock code="beam 3000 --tor" language="bash" />
            <p className="text-white/70 mt-3">
              Creates a Tor hidden service for your local port 3000. You'll receive a .onion address
              accessible from any Tor Browser or Tor-enabled client.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Dual Mode (Local + Tor)</h3>
            <CodeBlock code="beam 3000 --domain myapp.local --dual" language="bash" />
            <p className="text-white/70 mt-3 mb-3">
              Enables both local access via custom domain and global access via Tor simultaneously.
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/60 ml-4 text-sm">
              <li><strong>Local:</strong> http://myapp.local — fast, zero latency</li>
              <li><strong>Global:</strong> http://xyz...abc.onion — accessible worldwide</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Tor with HTTPS</h3>
            <CodeBlock code="beam 3000 --tor --https" language="bash" />
            <p className="text-white/70 mt-3">
              Adds a TLS layer on top of Tor's encryption. Useful when your application requires
              HTTPS (e.g., for service workers or secure cookies). Note that Tor already provides
              end-to-end encryption, so this is primarily for application-level requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Performance Considerations</h2>

        <p className="text-white/70 mb-4">
          Tor adds latency compared to direct connections. This is the tradeoff for privacy.
          Understanding the latency characteristics helps you decide when to use Tor mode.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Expected Latency</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Initial connection:</strong> 2-5 seconds (circuit building)</li>
            <li><strong className="text-white/90">Request latency:</strong> 100-300ms additional per request</li>
            <li><strong className="text-white/90">Circuit rebuild:</strong> ~3 seconds (happens periodically for security)</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Why the Latency?</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Traffic passes through 6 relays (3 on your side, 3 on client side)</li>
            <li>Each hop adds geographic latency—relays may be on different continents</li>
            <li>Cryptographic operations at each relay for encryption/decryption</li>
            <li>Relay bandwidth varies—some relays are faster than others</li>
          </ul>
        </div>

        <p className="text-white/60 text-sm">
          For rapid local development, use <InlineCode>beam 3000</InlineCode> without
          the <InlineCode>--tor</InlineCode> flag. Enable Tor only when you need
          external access for webhook testing, sharing with remote collaborators, or testing from
          mobile devices.
        </p>
      </section>

      {/* Security Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Security Benefits</h2>

        <p className="text-white/70 mb-4">
          Using Tor mode provides several security advantages over traditional tunneling services:
        </p>

        <ul className="list-disc list-inside space-y-3 text-white/70 ml-4 mb-6">
          <li>
            <strong className="text-white/90">IP Anonymization:</strong> Neither clients nor network observers
            can determine your real IP address. Your development machine's location remains hidden.
          </li>
          <li>
            <strong className="text-white/90">End-to-End Encryption:</strong> All traffic is encrypted from
            client to your server. Not even Tor relays can read your data—they only pass encrypted
            packets.
          </li>
          <li>
            <strong className="text-white/90">No Port Forwarding:</strong> Works behind any NAT or firewall.
            No router configuration needed. Tor punches through network restrictions automatically.
          </li>
          <li>
            <strong className="text-white/90">Censorship Resistance:</strong> Accessible from anywhere in the
            world, including countries that block traditional tunneling services like ngrok.
          </li>
          <li>
            <strong className="text-white/90">No Third-Party Trust:</strong> Unlike centralized services,
            there's no company that can log your traffic, comply with subpoenas, or shut down your tunnel.
          </li>
        </ul>
      </section>

      {/* When to Use Tor */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">When to Use Tor Mode</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Ideal Use Cases</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Webhook testing with external services (Stripe, GitHub, Twilio)</li>
            <li>Sharing development previews with remote team members</li>
            <li>Testing from mobile devices without local network access</li>
            <li>Development in restrictive network environments</li>
            <li>Privacy-sensitive projects where you don't want third parties seeing your traffic</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Consider Alternatives When</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Sub-50ms latency is critical for your testing</li>
            <li>You need to test with services that actively block Tor exit nodes</li>
            <li>Your organization's security policy prohibits Tor usage</li>
            <li>You're doing pure local development without external access needs</li>
          </ul>
        </div>
      </section>

      {/* Installing Tor */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Tor Installation</h2>

        <p className="text-white/70 mb-4">
          Beam includes an embedded Tor client, so you typically don't need to install Tor separately.
          However, if you prefer to use a system Tor installation, here's how:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">macOS (Homebrew)</h3>
            <CodeBlock code="brew install tor" language="bash" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Ubuntu/Debian</h3>
            <CodeBlock code="sudo apt install tor" language="bash" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Fedora/RHEL</h3>
            <CodeBlock code="sudo dnf install tor" language="bash" />
          </div>
        </div>

        <p className="text-white/60 text-sm mt-4">
          Verify installation with <InlineCode>tor --version</InlineCode>.
          Beam will automatically detect and use your system Tor if available.
        </p>
      </section>

      {/* Related Documentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Related Documentation</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— How Tor fits into Beam's overall system design
          </li>
          <li>
            <Link href="/docs/security" className="text-white underline hover:text-white/80">
              Security Model
            </Link>
            {" "}— Deep dive into encryption and privacy guarantees
          </li>
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— All Tor-related command line options
          </li>
          <li>
            <Link href="/docs/troubleshooting" className="text-white underline hover:text-white/80">
              Troubleshooting
            </Link>
            {" "}— Common Tor connection issues and solutions
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Learn more about Tor at the{" "}
          <a href="https://www.torproject.org/" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            Tor Project website
          </a>.
        </p>
      </footer>
    </article>
  );
}
