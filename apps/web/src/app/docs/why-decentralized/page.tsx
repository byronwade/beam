"use client";

import Link from "next/link";

export default function WhyDecentralizedPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Why Decentralized?</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Traditional tunneling services route your traffic through centralized servers. This creates
          fundamental problems that Beam solves by using decentralized architecture. Here is why that
          matters.
        </p>
      </header>

      {/* Visual Comparison Diagram */}
      <section className="mb-12">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 overflow-x-auto">
          <h3 className="text-center text-white/60 text-sm font-medium mb-6">Centralized vs Decentralized Architecture</h3>

          <div className="grid md:grid-cols-2 gap-8 min-w-[600px]">
            {/* Centralized */}
            <div>
              <h4 className="text-center text-red-400/80 text-sm font-medium mb-4">Centralized (ngrok, Cloudflare)</h4>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-2 text-center w-24">
                  <div className="text-white font-medium text-xs">You</div>
                </div>
                <div className="w-0.5 h-4 bg-red-500/50"></div>
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-3 text-center w-32">
                  <div className="text-white font-medium text-sm">Company</div>
                  <div className="text-red-400/70 text-[10px] mt-1">Sees all traffic</div>
                </div>
                <div className="w-0.5 h-4 bg-red-500/50"></div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-2 text-center w-24">
                  <div className="text-white font-medium text-xs">Client</div>
                </div>
                <div className="text-white/40 text-[10px] mt-2 text-center max-w-[140px]">
                  Single point of failure<br/>Can be blocked, logged, shut down
                </div>
              </div>
            </div>

            {/* Decentralized */}
            <div>
              <h4 className="text-center text-green-400/80 text-sm font-medium mb-4">Decentralized (Beam)</h4>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-2 text-center w-24">
                  <div className="text-white font-medium text-xs">You</div>
                </div>
                <div className="w-0.5 h-4 bg-purple-500/50"></div>
                <div className="flex items-center gap-1">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded p-1.5 text-center w-14">
                    <div className="text-white/80 text-[10px]">Relay</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded p-1.5 text-center w-14">
                    <div className="text-white/80 text-[10px]">Relay</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded p-1.5 text-center w-14">
                    <div className="text-white/80 text-[10px]">Relay</div>
                  </div>
                </div>
                <div className="text-purple-400/60 text-[9px]">Tor Network (distributed)</div>
                <div className="w-0.5 h-4 bg-purple-500/50"></div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-2 text-center w-24">
                  <div className="text-white font-medium text-xs">Client</div>
                </div>
                <div className="text-white/40 text-[10px] mt-2 text-center max-w-[140px]">
                  No single point of failure<br/>Private, censorship-resistant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem with Centralized Tunneling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">The Problem with Centralized Tunneling</h2>

        <p className="text-white/70 mb-4">
          When you use a centralized tunneling service like ngrok or Cloudflare Tunnel, all your
          traffic passes through their servers. This has several implications:
        </p>

        <div className="space-y-6 mb-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Privacy Concerns</h3>
            <p className="text-white/70">
              The tunneling provider can see, log, and analyze all traffic passing through their
              servers. Even with TLS, they terminate the connection and re-encrypt it — they have
              access to the plaintext data. Your requests, responses, headers, and payloads are
              all visible to them.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Single Point of Failure</h3>
            <p className="text-white/70">
              If the provider experiences an outage, all tunnels stop working. You are entirely
              dependent on their uptime, infrastructure, and business continuity. If they go out
              of business, deprecate their service, or have a major incident, your tunnels disappear.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Censorship Vulnerability</h3>
            <p className="text-white/70">
              Governments and ISPs can block access to the tunneling provider domains. If ngrok.io
              is blocked in your region, you cannot use the service. The provider can also be
              compelled to block specific tunnels or hand over user data.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Vendor Lock-in</h3>
            <p className="text-white/70">
              Your tunnel URLs are controlled by the provider. If you build integrations using their
              URLs, switching providers means updating all those integrations. You do not own your
              infrastructure.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Cost</h3>
            <p className="text-white/70">
              Running centralized infrastructure is expensive. Providers pass these costs to users
              through subscription fees, usage limits, and premium features. The more you use it,
              the more you pay.
            </p>
          </div>
        </div>
      </section>

      {/* How Decentralization Solves These Problems */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">How Decentralization Solves These Problems</h2>

        <p className="text-white/70 mb-6">
          Beam takes a fundamentally different approach by using the Tor network for tunneling.
          Instead of routing through a company servers, traffic flows through a distributed network
          of volunteer relays.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Privacy by Architecture</h3>
            <p className="text-white/70">
              With Tor, no single entity sees the full picture. Each relay only knows the previous
              and next hop — no relay can see both the source and destination. Traffic is encrypted
              in layers, and each relay peels off one layer. Even if a relay is compromised, it cannot
              decrypt the contents or identify the endpoints.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">No Single Point of Failure</h3>
            <p className="text-white/70">
              The Tor network consists of thousands of relays run by volunteers worldwide. If some
              relays go offline, traffic automatically routes around them. There is no company that
              can take down the network, no server that, if compromised, affects everyone.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Censorship Resistance</h3>
            <p className="text-white/70">
              Tor was designed specifically for censorship resistance. It uses techniques like
              bridge relays and pluggable transports to circumvent blocking. Even if a government
              blocks known Tor relays, users can connect through secret bridge nodes. Your tunnel
              remains accessible.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Self-Sovereign Infrastructure</h3>
            <p className="text-white/70">
              Your .onion address is derived from your cryptographic keys, which you control. No
              company can revoke it, expire it, or charge you for it. As long as you have your
              keys, you own your address forever.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Free to Use</h3>
            <p className="text-white/70">
              Since Beam uses the Tor network, there are no servers to pay for. The network is
              maintained by volunteers and funded by grants and donations. Beam itself is open
              source — you can inspect the code, contribute, or fork it.
            </p>
          </div>
        </div>
      </section>

      {/* The Tradeoffs */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">The Tradeoffs</h2>

        <p className="text-white/70 mb-4">
          Decentralization is not free. There are real tradeoffs compared to centralized services:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Latency</h3>
            <p className="text-white/70">
              Tor routes traffic through multiple relays, adding latency. Expect 200-500ms round-trip
              time compared to 30-100ms for centralized services. For development and testing this is
              usually acceptable; for latency-sensitive production use, it may not be.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Accessibility</h3>
            <p className="text-white/70">
              Clients need Tor Browser or a Tor proxy to access .onion addresses. This adds friction
              compared to a regular HTTPS URL. Beam dual-mode operation helps by providing both
              local access (fast) and Tor access (globally accessible).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Connection Time</h3>
            <p className="text-white/70">
              Starting a tunnel takes longer because Beam needs to build a Tor circuit (10-30 seconds
              on first run). Once established, the connection is persistent and reconnects automatically.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">No Web Dashboard</h3>
            <p className="text-white/70">
              Centralized services often provide web dashboards for request inspection, replay, and
              analytics. Since Beam has no central server, there is no dashboard. Use verbose mode
              for debugging.
            </p>
          </div>
        </div>
      </section>

      {/* When Decentralization Matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">When Decentralization Matters</h2>

        <p className="text-white/70 mb-4">
          Decentralization is not always necessary. Here is when it matters most:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Sensitive Development</h3>
            <p className="text-white/70">
              If you are working on proprietary code, handling user data, or developing security-critical
              applications, you may not want a third party seeing your development traffic. Beam ensures
              your work stays private.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Journalism and Activism</h3>
            <p className="text-white/70">
              For journalists protecting sources, activists organizing in hostile environments, or anyone
              who needs to communicate securely, Tor integration provides strong anonymity guarantees
              that centralized services cannot match.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Censored Regions</h3>
            <p className="text-white/70">
              In countries where centralized tunneling services are blocked, Beam Tor integration
              provides a way to expose local services to the outside world. Tor censorship resistance
              makes it harder to block.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Long-term Stability</h3>
            <p className="text-white/70">
              If you need persistent URLs that will not change due to provider policy changes, pricing
              tiers, or business shutdowns, self-sovereign .onion addresses provide stability that no
              commercial service can guarantee.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Philosophy</h3>
            <p className="text-white/70">
              Some developers prefer decentralized solutions on principle — not because they need the
              specific features, but because they value the independence and resilience of distributed
              systems. Beam is for those developers too.
            </p>
          </div>
        </div>
      </section>

      {/* The Future */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">The Future of Decentralized Tunneling</h2>

        <p className="text-white/70 mb-4">
          Beam is just the beginning. The roadmap includes integration with additional privacy networks
          and decentralized technologies:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">P2P Domain Registry</strong> — decentralized DNS using Kademlia DHT, so you can have human-readable names without central authority</li>
          <li><strong className="text-white/90">Nym Mixnet</strong> — alternative to Tor with improved metadata protection</li>
          <li><strong className="text-white/90">Veilid Framework</strong> — new decentralized application platform</li>
          <li><strong className="text-white/90">I2P Integration</strong> — garlic routing as an alternative to onion routing</li>
        </ul>

        <p className="text-white/70">
          The goal is to give developers choice — different privacy networks with different tradeoffs,
          all accessible through the same simple Beam CLI. Use what works for your situation.
        </p>
      </section>

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Summary</h2>

        <p className="text-white/70 mb-4">
          Centralized tunneling services are convenient but come with fundamental tradeoffs around
          privacy, availability, and control. Beam decentralized approach provides:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li>Privacy — no one sees your traffic</li>
          <li>Resilience — no single point of failure</li>
          <li>Censorship resistance — hard to block</li>
          <li>Self-sovereignty — you own your infrastructure</li>
          <li>Free to use — no subscription fees</li>
        </ul>

        <p className="text-white/70">
          The tradeoff is latency and accessibility. For development, testing, and privacy-conscious
          use cases, this is usually acceptable. For production applications requiring low latency,
          evaluate whether the privacy benefits justify the performance cost.
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
            {" "}— how Beam uses Tor for decentralized tunneling
          </li>
          <li>
            <Link href="/docs/p2p-networking" className="text-white underline hover:text-white/80">
              P2P Networking
            </Link>
            {" "}— the planned decentralized discovery layer
          </li>
          <li>
            <Link href="/docs/security" className="text-white underline hover:text-white/80">
              Security
            </Link>
            {" "}— encryption and privacy details
          </li>
          <li>
            <Link href="/docs/comparisons" className="text-white underline hover:text-white/80">
              Comparisons
            </Link>
            {" "}— how Beam compares to centralized alternatives
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Questions about decentralization or privacy? Check the{" "}
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
