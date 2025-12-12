"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function ComparisonsPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Beam vs Alternatives</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          How does Beam compare to other tunneling solutions like ngrok, Cloudflare Tunnel, and LocalTunnel?
          This guide provides an objective comparison across architecture, security, features, and pricing.
        </p>
      </header>

      {/* Quick Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Comparison</h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-medium">Service</th>
                <th className="text-left py-3 px-4 text-white font-medium">Architecture</th>
                <th className="text-left py-3 px-4 text-white font-medium">Security</th>
                <th className="text-left py-3 px-4 text-white font-medium">Performance</th>
                <th className="text-left py-3 px-4 text-white font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 bg-purple-500/5">
                <td className="py-3 px-4 text-white font-medium">Beam</td>
                <td className="py-3 px-4"><span className="text-purple-400">Decentralized</span></td>
                <td className="py-3 px-4"><span className="text-green-400">E2E + Tor</span></td>
                <td className="py-3 px-4 text-white/70">~200-500ms*</td>
                <td className="py-3 px-4"><span className="text-green-400">Free</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">ngrok</td>
                <td className="py-3 px-4"><span className="text-orange-400">Centralized</span></td>
                <td className="py-3 px-4 text-white/70">TLS</td>
                <td className="py-3 px-4 text-white/70">~50-100ms</td>
                <td className="py-3 px-4"><span className="text-yellow-400">Freemium</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">Cloudflare</td>
                <td className="py-3 px-4"><span className="text-blue-400">Edge Network</span></td>
                <td className="py-3 px-4 text-white/70">TLS + WAF</td>
                <td className="py-3 px-4 text-white/70">~20-50ms</td>
                <td className="py-3 px-4"><span className="text-yellow-400">Free tier</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">LocalTunnel</td>
                <td className="py-3 px-4"><span className="text-orange-400">Centralized</span></td>
                <td className="py-3 px-4 text-white/70">TLS</td>
                <td className="py-3 px-4 text-white/70">~100-200ms</td>
                <td className="py-3 px-4"><span className="text-green-400">Free</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">Serveo</td>
                <td className="py-3 px-4"><span className="text-orange-400">Centralized</span></td>
                <td className="py-3 px-4 text-white/70">SSH/TLS</td>
                <td className="py-3 px-4 text-white/70">~150-300ms</td>
                <td className="py-3 px-4"><span className="text-green-400">Free</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">Tailscale</td>
                <td className="py-3 px-4"><span className="text-cyan-400">Mesh VPN</span></td>
                <td className="py-3 px-4 text-white/70">WireGuard</td>
                <td className="py-3 px-4 text-white/70">~30-80ms</td>
                <td className="py-3 px-4"><span className="text-yellow-400">Freemium</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-white/50 text-sm mb-4">* Tor adds latency for privacy benefits</p>

        <p className="text-white/70">
          Each service makes different tradeoffs. Beam prioritizes privacy and decentralization over raw
          speed. ngrok and Cloudflare optimize for performance and enterprise features. LocalTunnel and
          Serveo offer simplicity with no account required.
        </p>
      </section>

      {/* Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Architecture Differences</h2>

        <h3 className="text-lg font-medium text-white mb-3">Beam: Decentralized via Tor</h3>
        <p className="text-white/70 mb-4">
          Beam creates Tor hidden services that route traffic through the Tor network. There is no
          central server that can inspect, log, or block your traffic. The tradeoff is higher latency
          (typically 200-500ms) due to Tor multi-hop routing.
        </p>

        {/* Beam Architecture Visual Diagram */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6 overflow-x-auto">
          <h4 className="text-center text-white/60 text-sm font-medium mb-4">Beam Architecture</h4>
          <div className="flex items-center justify-center gap-3 min-w-[500px]">
            {/* Client */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-white font-medium text-sm">Client</div>
                <div className="text-blue-400/70 text-[10px] mt-1">(Tor)</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-blue-500/50"></div>
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-purple-500/50"></div>
            </div>

            {/* Tor Network */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center min-w-[110px]">
                <div className="text-white font-medium text-sm">Tor Network</div>
                <div className="text-purple-400/70 text-[10px] mt-1">(3+ relays)</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-purple-500/50"></div>
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-green-500/50"></div>
            </div>

            {/* Beam Daemon */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-white font-medium text-sm">Beam</div>
                <div className="text-green-400/70 text-[10px] mt-1">Daemon</div>
              </div>
              {/* Arrow down to app */}
              <div className="flex flex-col items-center mt-2">
                <div className="w-0.5 h-4 bg-green-500/50"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-green-500/50"></div>
              </div>
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-lg p-2 text-center mt-2">
                <div className="text-white/80 font-medium text-xs">Your App</div>
                <div className="text-white/50 text-[10px]">:3000</div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-3">ngrok: Centralized SaaS</h3>
        <p className="text-white/70 mb-4">
          ngrok routes all traffic through their servers. This enables features like request
          inspection, replay, and custom domains, but means ngrok can see all your traffic.
          Performance is excellent (~50ms latency) due to optimized infrastructure.
        </p>

        {/* ngrok Architecture Visual Diagram */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6 overflow-x-auto">
          <h4 className="text-center text-white/60 text-sm font-medium mb-4">ngrok Architecture</h4>
          <div className="flex items-center justify-center gap-3 min-w-[500px]">
            {/* Client */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-white font-medium text-sm">Client</div>
                <div className="text-blue-400/70 text-[10px] mt-1">(HTTPS)</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-blue-500/50"></div>
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-orange-500/50"></div>
            </div>

            {/* ngrok Cloud */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-3 text-center min-w-[110px]">
                <div className="text-white font-medium text-sm">ngrok Cloud</div>
                <div className="text-orange-400/70 text-[10px] mt-1">(their servers)</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-orange-500/50"></div>
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-green-500/50"></div>
            </div>

            {/* ngrok Agent */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-white font-medium text-sm">ngrok</div>
                <div className="text-green-400/70 text-[10px] mt-1">Agent</div>
              </div>
              {/* Arrow down to app */}
              <div className="flex flex-col items-center mt-2">
                <div className="w-0.5 h-4 bg-green-500/50"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-green-500/50"></div>
              </div>
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-lg p-2 text-center mt-2">
                <div className="text-white/80 font-medium text-xs">Your App</div>
                <div className="text-white/50 text-[10px]">:3000</div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-3">Cloudflare Tunnel: Edge Network</h3>
        <p className="text-white/70 mb-4">
          Cloudflare Tunnel (formerly Argo Tunnel) connects your server to Cloudflare global edge
          network. Traffic is proxied through their CDN, enabling excellent performance and DDoS
          protection. Requires a Cloudflare account and domain.
        </p>

        <h3 className="text-lg font-medium text-white mb-3">LocalTunnel/Serveo: Simple Proxies</h3>
        <p className="text-white/70 mb-4">
          LocalTunnel and Serveo provide simple, no-account-required tunneling through community
          servers. Great for quick demos but reliability varies, and there is no guarantee of
          availability or privacy.
        </p>
      </section>

      {/* Security Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Security Comparison</h2>

        <p className="text-white/70 mb-4">
          Security models differ significantly between services:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Traffic Visibility</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li><strong className="text-white/90">Beam</strong> — No one sees your traffic (Tor encryption)</li>
              <li><strong className="text-white/90">ngrok</strong> — ngrok can inspect traffic at their servers</li>
              <li><strong className="text-white/90">Cloudflare</strong> — Cloudflare terminates TLS, can see traffic</li>
              <li><strong className="text-white/90">LocalTunnel</strong> — Server operator can see traffic</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">IP Anonymity</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li><strong className="text-white/90">Beam</strong> — Your IP is hidden behind Tor</li>
              <li><strong className="text-white/90">ngrok</strong> — Your IP visible to ngrok, hidden from clients</li>
              <li><strong className="text-white/90">Cloudflare</strong> — Your IP visible to Cloudflare, hidden from clients</li>
              <li><strong className="text-white/90">LocalTunnel</strong> — Your IP visible to server operator</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Data Logging</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li><strong className="text-white/90">Beam</strong> — No logging (Tor architecture prevents it)</li>
              <li><strong className="text-white/90">ngrok</strong> — Logs requests (check their privacy policy)</li>
              <li><strong className="text-white/90">Cloudflare</strong> — Logs requests and analytics</li>
              <li><strong className="text-white/90">LocalTunnel</strong> — Varies by instance</li>
            </ul>
          </div>
        </div>

        <p className="text-white/60 text-sm">
          For most development use cases, all services provide adequate security. Beam advantage
          is primarily for users who need strong privacy guarantees or censorship resistance.
        </p>
      </section>

      {/* Performance */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Performance</h2>

        <p className="text-white/70 mb-4">
          Latency varies significantly. Here is what to expect:
        </p>

        {/* Visual Latency Comparison */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6">
          <h3 className="text-center text-white/60 text-sm font-medium mb-6">Typical Latency (round-trip, approximate)</h3>

          <div className="space-y-4">
            {/* Cloudflare */}
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-white/80 text-right">Cloudflare</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/40 to-green-500/20 rounded" style={{ width: '10%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-green-400 font-medium">20-50ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">Edge network</div>
            </div>

            {/* Tailscale */}
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-white/80 text-right">Tailscale</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/40 to-cyan-500/20 rounded" style={{ width: '16%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-cyan-400 font-medium">30-80ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">Direct mesh</div>
            </div>

            {/* ngrok */}
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-white/80 text-right">ngrok</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500/40 to-orange-500/20 rounded" style={{ width: '20%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-orange-400 font-medium">50-100ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">Optimized servers</div>
            </div>

            {/* LocalTunnel */}
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-white/80 text-right">LocalTunnel</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500/40 to-yellow-500/20 rounded" style={{ width: '40%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-yellow-400 font-medium">100-200ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">Community servers</div>
            </div>

            {/* Serveo */}
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-white/80 text-right">Serveo</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/40 to-amber-500/20 rounded" style={{ width: '60%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-amber-400 font-medium">150-300ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">SSH overhead</div>
            </div>

            {/* Beam (Tor) */}
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-purple-400 text-right font-medium">Beam (Tor)</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/40 to-purple-500/20 rounded" style={{ width: '100%' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-purple-400 font-medium">200-500ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">Privacy tradeoff</div>
            </div>

            {/* Beam Local */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/10 mt-2">
              <div className="w-28 text-sm text-green-400 text-right font-medium">Beam (Local)</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/40 to-green-500/20 rounded" style={{ width: '2%', minWidth: '24px' }}></div>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <span className="text-xs text-green-400 font-medium">1-5ms</span>
                </div>
              </div>
              <div className="w-28 text-xs text-white/50">Minimal latency</div>
            </div>
          </div>

          <p className="text-white/50 text-xs mt-4 text-center">
            Tor latency is the price of privacy. Use local mode for fast development.
          </p>
        </div>

        <p className="text-white/70 mb-4">
          For development and testing, even 500ms latency is usually acceptable. The real question
          is what tradeoffs matter to you:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li>Need fastest possible latency? Use Cloudflare or ngrok</li>
          <li>Need privacy and censorship resistance? Use Beam</li>
          <li>Need simplest setup? Use LocalTunnel or Serveo</li>
          <li>Need to connect private machines? Use Tailscale</li>
        </ul>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Feature Comparison</h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-medium">Feature</th>
                <th className="text-center py-3 px-4 text-purple-400 font-medium">Beam</th>
                <th className="text-center py-3 px-4 text-white font-medium">ngrok</th>
                <th className="text-center py-3 px-4 text-white font-medium">Cloudflare</th>
                <th className="text-center py-3 px-4 text-white font-medium">LocalTunnel</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white/80">HTTPS</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white/80">WebSockets</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white/80">Custom domains</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span><span className="text-white/40 text-xs ml-1">*</span></td>
                <td className="py-3 px-4 text-center"><span className="text-yellow-400 text-xs">Paid</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white/80">Request inspection</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white/80">Persistent URLs</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-yellow-400 text-xs">Paid</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white/80">No account required</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
              </tr>
              <tr className="border-b border-white/10 bg-purple-500/5">
                <td className="py-3 px-4 text-white/80">Tor hidden services</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
              </tr>
              <tr className="border-b border-white/10 bg-purple-500/5">
                <td className="py-3 px-4 text-white/80">Local DNS resolution</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
              </tr>
              <tr className="border-b border-white/10 bg-purple-500/5">
                <td className="py-3 px-4 text-white/80">Offline-first</td>
                <td className="py-3 px-4 text-center"><span className="text-green-400">✓</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
                <td className="py-3 px-4 text-center"><span className="text-red-400">✗</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-white/50 text-sm mb-6">* Beam uses .onion addresses (persistent) and local domains</p>

        <h3 className="text-lg font-medium text-white mb-3">Beam-Specific Features</h3>
        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">Tor Hidden Services</strong> — your .onion address works from any Tor client worldwide</li>
          <li><strong className="text-white/90">Local DNS</strong> — use custom domains like <InlineCode>myapp.local</InlineCode> on your machine</li>
          <li><strong className="text-white/90">Dual-mode access</strong> — fast local + global Tor access simultaneously</li>
          <li><strong className="text-white/90">No account required</strong> — just install and run</li>
        </ul>

        <h3 className="text-lg font-medium text-white mb-3">ngrok-Specific Features</h3>
        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">Web dashboard</strong> — inspect and replay requests in browser</li>
          <li><strong className="text-white/90">Team accounts</strong> — shared tunnels and access control</li>
          <li><strong className="text-white/90">Custom subdomains</strong> — yourname.ngrok.io (paid)</li>
          <li><strong className="text-white/90">Extensive integrations</strong> — works with many development tools</li>
        </ul>

        <h3 className="text-lg font-medium text-white mb-3">Cloudflare-Specific Features</h3>
        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li><strong className="text-white/90">DDoS protection</strong> — Cloudflare WAF and anti-DDoS</li>
          <li><strong className="text-white/90">CDN caching</strong> — cache static assets at the edge</li>
          <li><strong className="text-white/90">Access policies</strong> — integrate with Cloudflare Access</li>
          <li><strong className="text-white/90">Analytics</strong> — traffic analytics and logging</li>
        </ul>
      </section>

      {/* Pricing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Pricing</h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-medium">Service</th>
                <th className="text-left py-3 px-4 text-white font-medium">Free Tier</th>
                <th className="text-left py-3 px-4 text-white font-medium">Paid Plans</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 bg-purple-500/5">
                <td className="py-3 px-4 text-purple-400 font-medium">Beam</td>
                <td className="py-3 px-4"><span className="text-green-400">Unlimited</span> <span className="text-white/50 text-xs">(open source)</span></td>
                <td className="py-3 px-4 text-white/50">N/A</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">ngrok</td>
                <td className="py-3 px-4 text-white/70">1 tunnel, 40 req/min</td>
                <td className="py-3 px-4 text-white/70">From <span className="text-yellow-400">$8/mo</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">Cloudflare</td>
                <td className="py-3 px-4 text-white/70">50 users, basic features</td>
                <td className="py-3 px-4 text-white/70">From <span className="text-yellow-400">$7/mo/user</span></td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">LocalTunnel</td>
                <td className="py-3 px-4"><span className="text-green-400">Unlimited</span> <span className="text-white/50 text-xs">(community)</span></td>
                <td className="py-3 px-4 text-white/50">N/A</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">Serveo</td>
                <td className="py-3 px-4"><span className="text-green-400">Unlimited</span> <span className="text-white/50 text-xs">(SSH)</span></td>
                <td className="py-3 px-4 text-white/50">N/A</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-white font-medium">Tailscale</td>
                <td className="py-3 px-4 text-white/70">100 devices, 3 users</td>
                <td className="py-3 px-4 text-white/70">From <span className="text-yellow-400">$5/user/mo</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-white/70 mb-4">
          Beam is open source and free to use. There is no company to pay because there are no
          central servers to maintain. You run everything locally and connect through the
          Tor network.
        </p>

        <p className="text-white/70">
          If you need enterprise features like team management, SLA guarantees, or dedicated
          support, ngrok and Cloudflare offer robust paid tiers. For individual developers or
          privacy-focused use cases, Beam free, decentralized model may be more appropriate.
        </p>
      </section>

      {/* Migration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Migrating from ngrok</h2>

        <p className="text-white/70 mb-4">
          If you are currently using ngrok and want to try Beam:
        </p>

        <CodeBlock
          code={`# Install Beam
npm install -g @byronwade/beam

# ngrok command:
ngrok http 3000

# Equivalent Beam command:
beam 3000`}
          language="bash"
          title="Migration from ngrok"
        />

        <p className="text-white/70 mb-4">
          Key differences to note:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li>Beam gives you a <InlineCode>.onion</InlineCode> address instead of <InlineCode>.ngrok.io</InlineCode></li>
          <li>Clients need Tor Browser or a Tor proxy to access your tunnel</li>
          <li>Initial connection takes longer (10-30 seconds for Tor circuit)</li>
          <li>No web dashboard — use <InlineCode>--verbose</InlineCode> for debugging</li>
          <li>Your <InlineCode>.onion</InlineCode> address persists across restarts</li>
        </ul>
      </section>

      {/* When to Use What */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">When to Use What</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Use Beam when:</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>Privacy is important (you do not want a company seeing your traffic)</li>
              <li>You need censorship resistance</li>
              <li>You want a persistent address without paying</li>
              <li>You are working on sensitive projects</li>
              <li>You prefer open source, self-hosted solutions</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Use ngrok when:</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>You need the lowest latency possible</li>
              <li>You want a web dashboard for request inspection</li>
              <li>You need team collaboration features</li>
              <li>You need integration with enterprise tools</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Use Cloudflare Tunnel when:</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>You are already using Cloudflare for your domain</li>
              <li>You need DDoS protection</li>
              <li>You want CDN caching for static assets</li>
              <li>You need enterprise access controls</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Use LocalTunnel/Serveo when:</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>You need a quick one-off tunnel with no setup</li>
              <li>You do not want to create any accounts</li>
              <li>You are doing a quick demo and reliability is not critical</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Summary</h2>

        <p className="text-white/70 mb-4">
          There is no single best tunneling solution — it depends on your priorities:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li><strong className="text-white/90">Best for privacy:</strong> Beam (Tor-based, decentralized)</li>
          <li><strong className="text-white/90">Best for speed:</strong> Cloudflare Tunnel (edge network)</li>
          <li><strong className="text-white/90">Best for features:</strong> ngrok (extensive tooling)</li>
          <li><strong className="text-white/90">Best for simplicity:</strong> LocalTunnel (zero setup)</li>
        </ul>
      </section>

      {/* Related Documentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Related Documentation</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/why-decentralized" className="text-white underline hover:text-white/80">
              Why Decentralized?
            </Link>
            {" "}— understand the philosophy behind Beam architecture
          </li>
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— how Beam uses Tor for privacy and accessibility
          </li>
          <li>
            <Link href="/docs/security" className="text-white underline hover:text-white/80">
              Security
            </Link>
            {" "}— Beam security model and encryption
          </li>
          <li>
            <Link href="/docs/getting-started" className="text-white underline hover:text-white/80">
              Getting Started
            </Link>
            {" "}— install Beam and create your first tunnel
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          This comparison reflects the state of each service as of late 2024. Features and pricing may
          have changed. Check each service documentation for current information.
        </p>
      </footer>
    </article>
  );
}
