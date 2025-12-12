"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function P2PNetworkingPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">P2P Networking</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Beam's P2P networking layer enables decentralized service discovery and intelligent routing
          without relying on central servers. This architecture provides censorship resistance, improved
          reliability, and eliminates single points of failure.
        </p>
        <p className="text-white/50 text-sm mt-4">
          Note: The P2P networking layer is in active development. Core Tor functionality is available
          today, while the full decentralized mesh network is being built.
        </p>
      </header>

      {/* Network Architecture Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Network Architecture</h2>

        <p className="text-white/70 mb-4">
          The P2P network forms a self-organizing mesh where peers can discover and connect to services
          without any central coordination. Each peer maintains connections to multiple other peers,
          creating redundant paths for communication.
        </p>

        {/* Visual P2P Network Topology Diagram */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-6 mb-6">
          <h3 className="text-center text-white/60 text-sm font-medium mb-6">P2P Network Topology</h3>

          {/* Peer Row with Bidirectional Connections */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {/* Peer A */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center min-w-[90px]">
              <div className="text-white font-medium text-sm">Peer A</div>
              <div className="text-white/50 text-xs">(Service)</div>
            </div>

            {/* Bidirectional Arrow */}
            <div className="flex flex-col items-center mx-1">
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-purple-500/50"></div>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-blue-500/50"></div>
                <div className="w-6 h-0.5 bg-gradient-to-l from-blue-500/50 to-purple-500/50"></div>
              </div>
            </div>

            {/* Peer B */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center min-w-[90px]">
              <div className="text-white font-medium text-sm">Peer B</div>
              <div className="text-white/50 text-xs">(Relay)</div>
            </div>

            {/* Bidirectional Arrow */}
            <div className="flex flex-col items-center mx-1">
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-purple-500/50 to-green-500/50"></div>
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-green-500/50"></div>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-purple-500/50"></div>
                <div className="w-6 h-0.5 bg-gradient-to-l from-purple-500/50 to-green-500/50"></div>
              </div>
            </div>

            {/* Peer C */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center min-w-[90px]">
              <div className="text-white font-medium text-sm">Peer C</div>
              <div className="text-white/50 text-xs">(Gateway)</div>
            </div>

            {/* Bidirectional Arrow */}
            <div className="flex flex-col items-center mx-1">
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-green-500/50 to-orange-500/50"></div>
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-orange-500/50"></div>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-green-500/50"></div>
                <div className="w-6 h-0.5 bg-gradient-to-l from-green-500/50 to-orange-500/50"></div>
              </div>
            </div>

            {/* Peer D */}
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-3 text-center min-w-[90px]">
              <div className="text-white font-medium text-sm">Peer D</div>
              <div className="text-white/50 text-xs">(Client)</div>
            </div>
          </div>

          {/* Connecting Line Down */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-cyan-500/50"></div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-cyan-500/50"></div>
            </div>
          </div>

          {/* Kademlia DHT */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-4 text-center">
              <div className="text-white font-medium text-sm">Kademlia DHT</div>
              <div className="text-white/50 text-xs">(Discovery)</div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/50 to-yellow-500/50"></div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-yellow-500/50"></div>
            </div>
          </div>

          {/* Gossip Protocol */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-white font-medium text-sm">Gossip Protocol</div>
              <div className="text-white/50 text-xs">(Propagation)</div>
            </div>
          </div>
        </div>

        <p className="text-white/70 mb-4">
          Key properties of this architecture:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li><strong className="text-white/90">No single point of failure</strong> — services remain accessible even if some peers go offline</li>
          <li><strong className="text-white/90">Self-healing topology</strong> — the network automatically routes around failures</li>
          <li><strong className="text-white/90">Censorship resistant</strong> — no central authority can block services</li>
          <li><strong className="text-white/90">Horizontal scaling</strong> — capacity increases as more peers join</li>
        </ul>
      </section>

      {/* Kademlia DHT */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Kademlia DHT</h2>

        <p className="text-white/70 mb-4">
          Kademlia is a peer-to-peer distributed hash table (DHT) that Beam uses for service discovery.
          It's the same algorithm used by BitTorrent, IPFS, and Ethereum for decentralized data storage
          and retrieval.
        </p>

        <h3 className="text-lg font-medium text-white mb-3">How Kademlia Works</h3>

        <p className="text-white/70 mb-4">
          Each node in the network has a unique 256-bit identifier. When you want to find a service,
          Kademlia calculates the "distance" between node IDs using XOR (exclusive or). Nodes that are
          "closer" to a service's key are more likely to know about it.
        </p>

        <CodeBlock
          code={`// XOR Distance Calculation
distance(node_a, node_b) = node_a.id XOR node_b.id

// Example: Finding service "myapp.local"
1. Hash "myapp.local" to get a 256-bit key
2. Query nodes closest to that key
3. Each node returns even closer nodes
4. Repeat until service record is found

// Lookup complexity: O(log n)
// For a network of 1 million peers, ~20 hops max`}
          language="javascript"
          showLineNumbers
        />

        <h3 className="text-lg font-medium text-white mb-3">Service Records</h3>

        <p className="text-white/70 mb-4">
          When a service registers with the DHT, it stores a record containing connection information.
          This record is replicated across multiple nodes for redundancy.
        </p>

        <CodeBlock
          code={`ServiceRecord {
  service_id: "myapp.local",
  peer_id: "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFoSdGKj",
  endpoints: [
    "/ip4/192.168.1.100/tcp/8080",
    "/ip6/::1/tcp/8080"
  ],
  metadata: {
    version: "1.0",
    protocol: "http",
    capabilities: ["websocket", "http2"]
  },
  ttl: 3600,        // Record expires in 1 hour
  signature: "0x..."  // Proves ownership
}`}
          language="json"
          showLineNumbers
        />

        <h3 className="text-lg font-medium text-white mb-3">K-Buckets</h3>

        <p className="text-white/70 mb-4">
          Each node maintains a routing table organized into "k-buckets" — groups of peer contacts
          sorted by XOR distance. When looking up a service, the node queries peers from the
          appropriate bucket, progressively narrowing down to the target.
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li>Bucket 0 contains peers with distance 0-1 (closest)</li>
          <li>Bucket 1 contains peers with distance 2-3</li>
          <li>Bucket n contains peers with distance 2^n to 2^(n+1) - 1</li>
          <li>Each bucket holds up to k peers (typically k=20)</li>
        </ul>
      </section>

      {/* Gossip Protocol */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Gossip Protocol</h2>

        <p className="text-white/70 mb-4">
          While Kademlia handles service discovery, the gossip protocol handles real-time propagation
          of announcements. When a service comes online or changes, the information spreads through
          the network like a rumor.
        </p>

        <h3 className="text-lg font-medium text-white mb-3">Message Types</h3>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><InlineCode>ANNOUNCE</InlineCode> — new service available</li>
          <li><InlineCode>DEPARTURE</InlineCode> — service going offline</li>
          <li><InlineCode>HEARTBEAT</InlineCode> — peer liveness check</li>
          <li><InlineCode>ROUTE_UPDATE</InlineCode> — routing table changes</li>
        </ul>

        <h3 className="text-lg font-medium text-white mb-3">Propagation</h3>

        <p className="text-white/70 mb-4">
          Each peer forwards messages to a random subset of its neighbors (the "fanout"). With a
          fanout of 6, a message reaches all 1000 peers in approximately 4 rounds.
        </p>

        <CodeBlock
          code={`Round 1: Origin sends to 6 peers
Round 2: 6 peers × 6 = 36 peers reached
Round 3: 36 × 6 = 216 peers reached
Round 4: 216 × 6 = 1,296 peers reached

// Propagation time: O(log n)
// With deduplication to prevent message floods`}
          language="text"
        />

        <p className="text-white/70">
          Messages include a TTL (time-to-live) that decrements with each hop, preventing infinite
          propagation loops. Peers track recently seen message IDs to avoid processing duplicates.
        </p>
      </section>

      {/* Intelligent Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Intelligent Routing</h2>

        <p className="text-white/70 mb-4">
          Beam's routing system continuously monitors network conditions and selects optimal paths
          based on multiple quality metrics. This enables automatic failover and load balancing.
        </p>

        <h3 className="text-lg font-medium text-white mb-3">Quality Metrics</h3>

        <p className="text-white/70 mb-4">
          Routes are scored based on:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">Latency (40%)</strong> — round-trip time to the destination</li>
          <li><strong className="text-white/90">Bandwidth (30%)</strong> — available throughput capacity</li>
          <li><strong className="text-white/90">Reliability (20%)</strong> — historical success rate</li>
          <li><strong className="text-white/90">Congestion (10%)</strong> — current load level</li>
        </ul>

        <CodeBlock
          code={`// Route scoring formula
score = (latency_score × 0.4) +
        (bandwidth_score × 0.3) +
        (reliability_score × 0.2) -
        (congestion_penalty × 0.1)

// Routes are re-evaluated every 30 seconds
// Traffic shifts automatically to better paths`}
          language="javascript"
        />

        <h3 className="text-lg font-medium text-white mb-3">Multi-Path Routing</h3>

        <p className="text-white/70 mb-4">
          When available, Beam can split traffic across multiple paths simultaneously. This provides:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
          <li>Automatic failover when one path fails</li>
          <li>Load balancing across available routes</li>
          <li>Increased aggregate bandwidth</li>
          <li>Reduced dependency on any single path</li>
        </ul>
      </section>

      {/* Peer Discovery and NAT Traversal */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Peer Discovery</h2>

        <p className="text-white/70 mb-4">
          New peers join the network through several discovery mechanisms:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">Bootstrap nodes</strong> — well-known entry points for initial connection</li>
          <li><strong className="text-white/90">mDNS</strong> — local network discovery without internet access</li>
          <li><strong className="text-white/90">DHT queries</strong> — find peers with specific capabilities</li>
          <li><strong className="text-white/90">Peer exchange</strong> — learn about peers from existing connections</li>
        </ul>

        <h3 className="text-lg font-medium text-white mb-3">NAT Traversal</h3>

        <p className="text-white/70 mb-4">
          Many peers are behind NAT (Network Address Translation), which makes direct connections
          challenging. Beam uses several techniques to establish connections:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li><strong className="text-white/90">STUN</strong> — discovers your public IP and port mapping, enabling direct connections when both peers have compatible NAT types</li>
          <li><strong className="text-white/90">Hole punching</strong> — coordinated connection attempts that "punch" through NAT by having both peers send packets simultaneously</li>
          <li><strong className="text-white/90">TURN relay</strong> — fallback to relay servers when direct connection is impossible (e.g., symmetric NAT)</li>
        </ul>

        <p className="text-white/70">
          Beam attempts direct connection first, falling back to relay only when necessary. Relay
          nodes are other Beam peers that volunteer to forward traffic.
        </p>
      </section>

      {/* Connection Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Connection Management</h2>

        <p className="text-white/70 mb-4">
          Each peer maintains a target number of connections (default: 25-50). The connection
          manager continuously optimizes the peer set:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-6">
          <li>Prioritizes geographically diverse peers for resilience</li>
          <li>Replaces low-quality connections opportunistically</li>
          <li>Handles churn with automatic reconnection</li>
          <li>Monitors connection health with periodic heartbeats</li>
        </ul>

        <h3 className="text-lg font-medium text-white mb-3">Connection Lifecycle</h3>

        <CodeBlock
          code={`1. Discovery    → Find peer via DHT, mDNS, or gossip
2. Handshake    → Exchange capabilities and authenticate
3. Connection   → Establish encrypted channel
4. Monitoring   → Periodic health checks (every 30s)
5. Optimization → Replace if better peer available
6. Graceful close or timeout → Clean disconnection`}
          language="text"
        />

        <p className="text-white/70">
          Failed connections are retried with exponential backoff. After repeated failures, peers
          are temporarily blacklisted to avoid wasting resources.
        </p>
      </section>

      {/* Performance Targets */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Performance Targets</h2>

        <p className="text-white/70 mb-6">
          The P2P layer is designed to meet these performance goals:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Discovery Performance</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>Service discovery: &lt;2 seconds</li>
              <li>Service registration: &lt;500ms</li>
              <li>Network join time: &lt;10 seconds</li>
              <li>Discovery success rate: &gt;98%</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Routing Performance</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>Route calculation: &lt;100ms</li>
              <li>Failover time: &lt;5 seconds</li>
              <li>Additional routing latency: &lt;50ms</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Scalability</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>Maximum network size: 1M+ peers</li>
              <li>Connections per peer: 25-50</li>
              <li>DHT replication factor: 20</li>
              <li>Gossip fanout: 6</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Development Status */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Development Status</h2>

        <p className="text-white/70 mb-4">
          The P2P networking layer is being developed in phases:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white/90 mb-2">Phase 1: Core Discovery (Completed)</h3>
            <ul className="list-disc list-inside space-y-1 text-white/70 ml-4">
              <li>Basic Kademlia DHT implementation</li>
              <li>Service registration and lookup</li>
              <li>Bootstrap node connectivity</li>
              <li>Local mDNS discovery</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white/90 mb-2">Phase 2: Routing System (In Progress)</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60 ml-4">
              <li>Quality-aware path selection</li>
              <li>Real-time metrics collection</li>
              <li>Multi-path routing</li>
              <li>Automatic failover</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white/90 mb-2">Phase 3: Advanced Features (Planned)</h3>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-4">
              <li>ML-based route prediction</li>
              <li>Bandwidth reservation</li>
              <li>Adaptive load balancing</li>
              <li>Network analytics dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Related Documentation</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— see how P2P fits into the overall system design
          </li>
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— current tunneling implementation using Tor
          </li>
          <li>
            <Link href="/docs/security" className="text-white underline hover:text-white/80">
              Security
            </Link>
            {" "}— P2P security considerations and threat model
          </li>
          <li>
            <Link href="/docs/why-decentralized" className="text-white underline hover:text-white/80">
              Why Decentralized?
            </Link>
            {" "}— benefits of the P2P architecture approach
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          The P2P networking layer is under active development. For the latest updates, follow the
          project on{" "}
          <a href="https://github.com/byronwade/beam" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      </footer>
    </article>
  );
}
