"use client";

import Link from "next/link";
import { InlineCode } from "@/components/code-block";

export default function SecurityPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Security Model</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Beam implements a zero-trust security architecture where no entity is trusted by default.
          All traffic is encrypted end-to-end, no data is collected, and your development environment
          remains completely private. This page explains the security properties, threat model, and
          best practices.
        </p>
      </header>

      {/* Zero Trust */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Zero-Trust Architecture</h2>

        <p className="text-white/70 mb-4">
          Traditional tunneling services require you to trust a central provider with your traffic.
          They see every request, can log everything, and could be compelled to hand over data. Beam
          takes a fundamentally different approach: there is no central service to trust.
        </p>

        <p className="text-white/70 mb-4">
          When you use Beam, traffic flows directly between you and your clients—either locally
          (no network at all) or through the Tor network (encrypted and anonymized). No Beam-operated
          servers ever see your data. The only infrastructure involved is your machine and the
          decentralized Tor network.
        </p>

        <p className="text-white/70">
          This means there's no company that can:
        </p>
        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mt-3">
          <li>Read your traffic or log your requests</li>
          <li>Comply with subpoenas or government data requests</li>
          <li>Shut down your tunnel or ban your account</li>
          <li>Raise prices or change terms of service</li>
          <li>Go out of business and take your tunnels offline</li>
        </ul>
      </section>

      {/* Encryption */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Encryption</h2>

        <p className="text-white/70 mb-4">
          Beam provides end-to-end encryption through multiple layers, ensuring your traffic remains
          confidential regardless of the network path it takes.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Local HTTPS (TLS 1.3)</h3>
          <p className="text-white/70 mb-3">
            When using the <InlineCode>--https</InlineCode> flag,
            Beam generates self-signed certificates and serves your local traffic over TLS 1.3:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Key Exchange:</strong> ECDHE with X25519 curve</li>
            <li><strong className="text-white/90">Encryption:</strong> AES-256-GCM authenticated encryption</li>
            <li><strong className="text-white/90">Forward Secrecy:</strong> New keys for each session; past traffic can't be decrypted</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Tor Encryption (3 Layers)</h3>
          <p className="text-white/70 mb-3">
            When using Tor mode, traffic is encrypted in three layers, one for each relay:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Onion Routing:</strong> Each relay decrypts one layer, revealing only the next hop</li>
            <li><strong className="text-white/90">Hidden Service Keys:</strong> Ed25519 for service identity, Curve25519 for sessions</li>
            <li><strong className="text-white/90">Circuit Encryption:</strong> AES-CTR with fresh keys for each circuit</li>
          </ul>
        </div>

        <p className="text-white/60 text-sm">
          When using both HTTPS and Tor together, you get two independent layers of encryption—TLS
          inside Tor. This provides defense in depth even if one layer were somehow compromised.
        </p>
      </section>

      {/* Key Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Key Management</h2>

        <p className="text-white/70 mb-4">
          Cryptographic keys are central to Beam's security. Here's how they're generated,
          stored, and rotated:
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Hidden Service Keys</h3>
          <p className="text-white/70 mb-3">
            Your .onion address is derived from an Ed25519 public key. These keys are:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Generated locally on first run using a cryptographically secure random number generator</li>
            <li>Stored in <InlineCode>~/.beam/keys/</InlineCode> with filesystem permissions (600)</li>
            <li>Never transmitted over the network except as part of the Tor protocol</li>
            <li>Reused across sessions so you keep the same .onion address</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Session Keys</h3>
          <p className="text-white/70 mb-3">
            For each tunnel session and connection:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Ephemeral keys are generated using Diffie-Hellman key exchange</li>
            <li>Keys exist only in memory and are never persisted to disk</li>
            <li>Tor circuits are rebuilt periodically (every ~10 minutes) with new keys</li>
            <li>Compromise of session keys doesn't affect past traffic (forward secrecy)</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">TLS Certificates</h3>
          <p className="text-white/70 mb-3">
            For local HTTPS, Beam generates self-signed certificates:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Created on-demand for each domain you configure</li>
            <li>Stored in <InlineCode>~/.beam/certs/</InlineCode></li>
            <li>Valid for 1 year; regenerated automatically when expired</li>
            <li>Your browser will show a warning since they're not CA-signed (expected for development)</li>
          </ul>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Privacy Protection</h2>

        <p className="text-white/70 mb-4">
          Beam is designed with privacy as a core principle, not an afterthought:
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">No Data Collection</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>No analytics, telemetry, or usage tracking of any kind</li>
            <li>No request logging—Beam doesn't store what URLs you access</li>
            <li>No IP address collection—your location is never recorded</li>
            <li>No "phone home" behavior—Beam doesn't contact any servers except for npm updates</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">IP Anonymization (Tor Mode)</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>Your real IP is hidden from clients connecting to your tunnel</li>
            <li>Client IPs are hidden from you (mutual anonymity)</li>
            <li>Network observers see only encrypted Tor traffic, not the content</li>
            <li>Even Tor relays can't see both source and destination</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Local-First Design</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>All processing happens on your machine</li>
            <li>Configuration stored locally in <InlineCode>~/.beam/</InlineCode></li>
            <li>No cloud accounts, subscriptions, or external dependencies</li>
            <li>Works completely offline in local-only mode</li>
          </ul>
        </div>
      </section>

      {/* Threat Model */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Threat Model</h2>

        <p className="text-white/70 mb-4">
          Understanding what Beam protects against (and what it doesn't) helps you make informed
          decisions about when and how to use it.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Protected Threats</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li><strong className="text-white/90">Network eavesdropping:</strong> Encrypted traffic can't be read by ISPs, network admins, or attackers on the same WiFi</li>
            <li><strong className="text-white/90">Man-in-the-middle attacks:</strong> TLS and Tor cryptography prevent traffic interception and modification</li>
            <li><strong className="text-white/90">IP address exposure:</strong> Tor mode hides your real IP from clients and observers</li>
            <li><strong className="text-white/90">Traffic analysis:</strong> Tor's multi-hop routing makes it hard to correlate traffic patterns</li>
            <li><strong className="text-white/90">Vendor surveillance:</strong> No central service sees your traffic or collects your data</li>
            <li><strong className="text-white/90">Service disruption:</strong> No central point of failure; tunnels work as long as Tor does</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Partial Protection</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>
              <strong className="text-white/90">Timing attacks:</strong> Tor provides some protection against traffic timing
              analysis, but sophisticated adversaries with global network visibility may still
              correlate traffic patterns.
            </li>
            <li>
              <strong className="text-white/90">Application vulnerabilities:</strong> Beam secures the transport layer.
              If your application has security bugs (XSS, SQL injection, etc.), Beam doesn't protect
              against those.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Not Protected</h3>
          <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
            <li>
              <strong className="text-white/90">Endpoint compromise:</strong> If your development machine is compromised
              by malware, encryption won't help—the attacker has access before encryption happens.
            </li>
            <li>
              <strong className="text-white/90">Social engineering:</strong> If you share your .onion URL publicly or
              with untrusted parties, they can access your tunnel. Treat .onion URLs like passwords.
            </li>
            <li>
              <strong className="text-white/90">Nation-state adversaries:</strong> Highly resourced adversaries with
              extensive surveillance capabilities may be able to deanonymize Tor users through
              advanced techniques. For most development use cases, this is not a realistic threat.
            </li>
          </ul>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Security Best Practices</h2>

        <p className="text-white/70 mb-4">
          Follow these guidelines to get the most security benefit from Beam:
        </p>

        <ul className="list-disc list-inside space-y-3 text-white/70 ml-4">
          <li>
            <strong className="text-white/90">Keep Beam updated:</strong> Run <InlineCode>npm update -g @byronwade/beam</InlineCode>
            regularly to get security patches and bug fixes.
          </li>
          <li>
            <strong className="text-white/90">Use Tor for sensitive work:</strong> Enable <InlineCode>--tor</InlineCode>
            when exposing services that handle sensitive data or when privacy matters.
          </li>
          <li>
            <strong className="text-white/90">Don't share .onion URLs publicly:</strong> Treat your .onion address
            like a password. Share only with trusted parties who need access.
          </li>
          <li>
            <strong className="text-white/90">Secure your local application:</strong> Beam secures the tunnel,
            but your application must handle authentication, authorization, and input validation properly.
          </li>
          <li>
            <strong className="text-white/90">Stop tunnels when not needed:</strong> Don't leave tunnels running
            indefinitely. Stop them when you're done to minimize attack surface.
          </li>
          <li>
            <strong className="text-white/90">Protect your keys:</strong> The <InlineCode>~/.beam/keys/</InlineCode>
            directory contains your hidden service identity. Back it up securely if you need
            persistent .onion addresses.
          </li>
          <li>
            <strong className="text-white/90">Use for development only:</strong> Beam is designed for development
            and testing environments. For production deployments, use proper infrastructure with
            additional security layers.
          </li>
        </ul>
      </section>

      {/* Vulnerability Reporting */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Security Vulnerability Reporting</h2>

        <p className="text-white/70 mb-4">
          If you discover a security vulnerability in Beam, please report it responsibly:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li>Do NOT disclose the vulnerability publicly until it's been fixed</li>
          <li>Open a private security advisory on GitHub or email the maintainer directly</li>
          <li>Include steps to reproduce the vulnerability and potential impact assessment</li>
          <li>We'll acknowledge receipt within 48 hours and work on a fix</li>
        </ol>

        <p className="text-white/60 text-sm">
          Security researchers who responsibly disclose vulnerabilities will be credited in
          release notes (unless they prefer anonymity).
        </p>
      </section>

      {/* Related Documentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Related Documentation</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— Deep dive into Tor encryption and anonymity
          </li>
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— System design and security boundaries
          </li>
          <li>
            <Link href="/docs/why-decentralized" className="text-white underline hover:text-white/80">
              Why Decentralized?
            </Link>
            {" "}— Security benefits of decentralization
          </li>
          <li>
            <Link href="/docs/troubleshooting" className="text-white underline hover:text-white/80">
              Troubleshooting
            </Link>
            {" "}— Security-related issues and solutions
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Security is a process, not a product. Beam is open source—audit the code yourself on{" "}
          <a href="https://github.com/byronwade/beam" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      </footer>
    </article>
  );
}
