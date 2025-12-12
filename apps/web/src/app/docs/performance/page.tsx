import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Scale, Gauge, Globe, HardDrive, Network, Timer, TrendingUp, AlertTriangle } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-6">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <Gauge className="h-6 w-6 text-yellow-400" />
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            Performance Guide
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Performance Optimization
        </h1>
        <p className="text-lg text-white/60">
          Beam offers three tunnel modes to balance speed and privacy. Choose the right mode for your use case
          and optimize performance with caching, circuit prebuilding, and geographic relay selection.
        </p>
      </div>

      {/* Connection Modes */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Scale className="h-5 w-5 text-purple-400" />
          Connection Modes
        </h2>

        <div className="grid gap-6">
          {/* Direct Internet Mode */}
          <Card className="bg-[#111] border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Zap className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Direct Internet Mode</CardTitle>
                    <CardDescription className="text-white/50">Direct UPnP/NAT-PMP Connection (Default)</CardDescription>
                  </div>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  ~0ms Added
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Privacy Level</span>
                  <p className="text-white">Standard (Public IP Visible)</p>
                </div>
                <div>
                  <span className="text-white/40">Requires Tor</span>
                  <p className="text-white">No</p>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-cyan-400 text-sm">beam 3000</code>
              </div>
              <div className="text-sm text-white/60">
                <strong className="text-white">Best for:</strong> 99% of development. Webhooks, mobile testing,
                sharing with clients. Fastest possible speed. Supported by Green Lock.
              </div>
            </CardContent>
          </Card>

          {/* Fast Mode (Tunnel) */}
          <Card className="bg-[#111] border-green-500/30 hover:border-green-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Zap className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Fast Tunnel</CardTitle>
                    <CardDescription className="text-white/50">P2P Assisted Tunnel</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ~50ms+
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Privacy Level</span>
                  <p className="text-white">Low - IP visible to peer</p>
                </div>
                <div>
                  <span className="text-white/40">Requires Tor</span>
                  <p className="text-white">No (Uses P2P)</p>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-green-400 text-sm">beam tunnel 3000 --mode=fast</code>
              </div>
              <div className="text-sm text-white/60">
                <strong className="text-white">Best for:</strong> Specific P2P use cases where UPnP fails but direct connection is preferred.
              </div>
            </CardContent>
          </Card>

          {/* Balanced Mode */}
          <Card className="bg-[#111] border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Scale className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Balanced Tunnel</CardTitle>
                    <CardDescription className="text-white/50">Single-hop Tor</CardDescription>
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  ~150ms+
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Privacy Level</span>
                  <p className="text-white">Medium - Server exposed, clients hidden</p>
                </div>
                <div>
                  <span className="text-white/40">Requires Tor</span>
                  <p className="text-white">Yes</p>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-yellow-400 text-sm">beam tunnel 3000 --mode=balanced</code>
              </div>
              <div className="text-sm text-white/60">
                <strong className="text-white">Best for:</strong> Anonymous testing where speed is still factor.
              </div>
            </CardContent>
          </Card>

          {/* Private Mode */}
          <Card className="bg-[#111] border-purple-500/30 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Private Tunnel</CardTitle>
                    <CardDescription className="text-white/50">Full 3-hop Tor onion routing</CardDescription>
                  </div>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  ~500ms+
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Privacy Level</span>
                  <p className="text-white">High - Full anonymity</p>
                </div>
                <div>
                  <span className="text-white/40">Requires Tor</span>
                  <p className="text-white">Yes</p>
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-purple-400 text-sm">beam tunnel 3000 --mode=private</code>
              </div>
              <div className="text-sm text-white/60">
                <strong className="text-white">Best for:</strong> Sensitive data, censorship circumvention, maximum privacy.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Comparison with Other Tools
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 font-medium">Tool</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Encryption</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Latency</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Privacy</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/5 bg-cyan-500/5">
                <td className="py-3 px-4 font-medium text-cyan-400">Beam (Direct)</td>
                <td className="py-3 px-4">Direct UPnP</td>
                <td className="py-3 px-4">Trusted SSL (Green Lock)</td>
                <td className="py-3 px-4">~0ms Added</td>
                <td className="py-3 px-4">Standard</td>
              </tr>
              <tr className="border-b border-white/5 bg-green-500/5">
                <td className="py-3 px-4 font-medium text-green-400">Beam (Fast Tunnel)</td>
                <td className="py-3 px-4">P2P Assisted</td>
                <td className="py-3 px-4">E2E</td>
                <td className="py-3 px-4">~50ms+</td>
                <td className="py-3 px-4">Low</td>
              </tr>
              <tr className="border-b border-white/5 bg-yellow-500/5">
                <td className="py-3 px-4 font-medium text-yellow-400">Beam (Balanced)</td>
                <td className="py-3 px-4">Single-hop Tor</td>
                <td className="py-3 px-4">E2E + Tor</td>
                <td className="py-3 px-4">~150ms+</td>
                <td className="py-3 px-4">Medium</td>
              </tr>
              <tr className="border-b border-white/5 bg-purple-500/5">
                <td className="py-3 px-4 font-medium text-purple-400">Beam (Private)</td>
                <td className="py-3 px-4">3-hop Tor</td>
                <td className="py-3 px-4">E2E + Tor</td>
                <td className="py-3 px-4">~500ms+</td>
                <td className="py-3 px-4">High</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">ngrok</td>
                <td className="py-3 px-4">Centralized</td>
                <td className="py-3 px-4">TLS</td>
                <td className="py-3 px-4">~50-100ms</td>
                <td className="py-3 px-4">Low</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">Cloudflare Tunnel</td>
                <td className="py-3 px-4">Edge Network</td>
                <td className="py-3 px-4">TLS + WAF</td>
                <td className="py-3 px-4">~20-50ms</td>
                <td className="py-3 px-4">Low</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Performance Optimizations */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Gauge className="h-5 w-5 text-orange-400" />
          Performance Optimizations (Tunnels Only)
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Circuit Prebuilding */}
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Network className="h-5 w-5 text-blue-400" />
                </div>
                <CardTitle className="text-white text-lg">Circuit Prebuilding</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/60">
                Pre-establishes Tor circuits before they&apos;re needed, eliminating the 2-3 second
                circuit build time on first request.
              </p>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-blue-400 text-sm">beam tunnel 3000 --prebuild-circuits=5</code>
              </div>
              <p className="text-xs text-white/40">
                Default: 3 circuits. More circuits = faster failover but higher memory.
              </p>
            </CardContent>
          </Card>

          {/* Response Caching */}
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <HardDrive className="h-5 w-5 text-green-400" />
                </div>
                <CardTitle className="text-white text-lg">Response Caching</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/60">
                Caches static assets (JS, CSS, images, fonts) to reduce round-trips through Tor.
                Especially effective for balanced and private modes.
              </p>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5 space-y-1">
                <code className="text-green-400 text-sm block">beam tunnel 3000 --cache-size=200</code>
                <code className="text-green-400 text-sm block">beam tunnel 3000 --cache-ttl=600</code>
              </div>
              <p className="text-xs text-white/40">
                Default: 100MB cache, 300s TTL. Disable with --no-cache.
              </p>
            </CardContent>
          </Card>

          {/* Geographic Optimization */}
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Globe className="h-5 w-5 text-yellow-400" />
                </div>
                <CardTitle className="text-white text-lg">Geographic Relay Selection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/60">
                Select Tor relays closer to your location for reduced latency.
                Uses ISO 3166-1 country codes.
              </p>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-yellow-400 text-sm">beam tunnel 3000 --geo-prefer=US,CA,MX</code>
              </div>
              <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-400/80">
                  Not recommended for private mode - reduces anonymity by constraining relay selection.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Persistent Circuits */}
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Timer className="h-5 w-5 text-purple-400" />
                </div>
                <CardTitle className="text-white text-lg">Persistent Circuits</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/60">
                Keeps Tor circuits alive between requests, avoiding reconnection overhead.
                Enabled by default in balanced and private modes.
              </p>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                <code className="text-purple-400 text-sm">
                  # Automatic - circuits persist for session duration
                </code>
              </div>
              <p className="text-xs text-white/40">
                Circuits automatically rebuild on failure or after extended idle periods.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6">Best Practices by Use Case</h2>

        <div className="space-y-4">
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Day-to-Day Development</h3>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5 mb-3">
                <code className="text-cyan-400 text-sm">
                  beam 3000
                </code>
              </div>
              <p className="text-sm text-white/60">
                Use Direct Mode for 99% of tasks like testing webhooks, mobile debugging,
                and showing "localhost" to colleagues.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Anonymous Webhook Development</h3>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5 mb-3">
                <code className="text-cyan-400 text-sm">
                  beam tunnel 3000 --mode=balanced --prebuild-circuits=3 --cache-ttl=60
                </code>
              </div>
              <p className="text-sm text-white/60">
                Balanced mode provides .onion address for webhooks while keeping latency reasonable.
                Lower cache TTL since webhook payloads change frequently.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Privacy-Sensitive Testing</h3>
              <div className="p-3 bg-black/30 rounded-lg border border-white/5 mb-3">
                <code className="text-cyan-400 text-sm">
                  beam tunnel 3000 --mode=private --prebuild-circuits=5 --no-cache
                </code>
              </div>
              <p className="text-sm text-white/60">
                Full Tor anonymity with extra prebuilt circuits for reliability.
                Caching disabled to prevent data persistence.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6">Performance Troubleshooting</h2>

        <div className="space-y-4">
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">High Latency in Balanced/Private Mode</h3>
              <ul className="text-sm text-white/60 space-y-2 list-disc list-inside">
                <li>Increase prebuild circuit count: <code className="text-white/80">--prebuild-circuits=5</code></li>
                <li>Try geographic optimization: <code className="text-white/80">--geo-prefer=YOUR_COUNTRY</code></li>
                <li>Enable verbose logging to identify bottlenecks: <code className="text-white/80">-v</code></li>
                <li>Check if Tor is running properly: <code className="text-white/80">tor --verify-config</code></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Slow First Request</h3>
              <ul className="text-sm text-white/60 space-y-2 list-disc list-inside">
                <li>Circuit building takes 2-3 seconds on first connection</li>
                <li>Enable circuit prebuilding (default) to eliminate this delay</li>
                <li>Consider fast mode for development where privacy isn&apos;t critical</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Cache Not Working</h3>
              <ul className="text-sm text-white/60 space-y-2 list-disc list-inside">
                <li>Only static assets are cached (JS, CSS, images, fonts)</li>
                <li>Check if your responses include proper Cache-Control headers</li>
                <li>Private mode disables caching by default for security</li>
                <li>Increase cache size if serving large assets: <code className="text-white/80">--cache-size=200</code></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CLI Reference */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-6">Performance CLI Options</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 font-medium">Option</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Default</th>
                <th className="text-left py-3 px-4 text-white/60 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--mode</td>
                <td className="py-3 px-4">balanced</td>
                <td className="py-3 px-4">Tunnel mode: fast, balanced, or private</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--cache-size</td>
                <td className="py-3 px-4">100</td>
                <td className="py-3 px-4">Cache size in MB</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--cache-ttl</td>
                <td className="py-3 px-4">300</td>
                <td className="py-3 px-4">Cache TTL in seconds</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--no-cache</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Disable response caching</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--geo-prefer</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Preferred relay countries (ISO codes)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--prebuild-circuits</td>
                <td className="py-3 px-4">3</td>
                <td className="py-3 px-4">Number of circuits to prebuild</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-cyan-400">--no-prebuild</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Disable circuit prebuilding</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
