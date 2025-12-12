"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Shield, Zap, Layers, AlertCircle, Radio, Lock, Globe } from "lucide-react";

export default function RoadmapPage() {
    return (
        <article className="mx-auto max-w-4xl px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Project Roadmap</h1>
                <p className="text-lg text-white/70 leading-relaxed">
                    Beam is evolving from a Tor-only tunneling tool into a universal, decentalized networking protocol.
                    Our vision is to provide developers with a "transport-agnostic" layer that automatically selects the
                    best network (Tor, I2P, Nym, WebRTC) based on the user's need for privacy, latency, or throughput.
                </p>
            </header>

            {/* Phase 1: Transport Agnosticism */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary" />
                    Phase 1: Multi-Network Support
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-orange-500/10"><Layers className="w-4 h-4 text-orange-400" /></div>
                                I2P Integration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> High-throughput hidden services.</p>
                            <p>I2P's garlic routing and unidirectional tunnels offer better performance for file transfers and heavy APIs compared to Tor.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-blue-500/10"><Shield className="w-4 h-4 text-blue-400" /></div>
                                Nym Mixnet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Metadata privacy.</p>
                            <p>Protection against global passive adversaries by mixing and delaying packets, making traffic analysis mathematically impossible.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-purple-500/10"><Network className="w-4 h-4 text-purple-400" /></div>
                                Veilid & Libp2p
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Mobile-first P2P.</p>
                            <p>Integrating modern P2P frameworks to allow direct device-to-device connections without central signaling servers.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Phase 2: Performance & Connectivity */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Phase 2: Performance & Connectivity
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-yellow-500/10"><Radio className="w-4 h-4 text-yellow-400" /></div>
                                WebRTC & Holepunch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Instant, low-latency tunnels.</p>
                            <p>Leveraging DHT-based signaling to establish direct browser-to-browser streams. This enables "Fast Mode" for video streaming and gaming use cases.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-cyan-500/10"><Lock className="w-4 h-4 text-cyan-400" /></div>
                                WireGuard Integration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Trusted, high-speed links.</p>
                            <p>Optional WireGuard-based point-to-point links for team members who trust each other and need maximum socket performance over anonymity.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Phase 3: Ecosystem Expansion */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-green-400" />
                    Phase 3: Market Expansion
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-medium text-green-500">1</span>
                            <div>
                                <h4 className="font-medium text-white">Edge Computing Integration</h4>
                                <p className="text-sm text-white/60">Allow Beam to act as an ephemeral edge node, enabling "Serverless on User Device" architectures.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-medium text-green-500">2</span>
                            <div>
                                <h4 className="font-medium text-white">IoT Fleet Management</h4>
                                <p className="text-sm text-white/60">Embed Beam into IoT devices for secure remote management without complex VPNs or static IPs.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-medium text-green-500">3</span>
                            <div>
                                <h4 className="font-medium text-white">Decentralized VPN (dVPN)</h4>
                                <p className="text-sm text-white/60">Allow users to route general internet traffic through the Beam mesh, competing with traditional VPNs.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Phase 4: Censorship Resistance */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" />
                    Phase 4: Censorship Resistance
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-red-500/10"><Lock className="w-4 h-4 text-red-400" /></div>
                                Pluggable Transports
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Evade Deep Packet Inspection (DPI).</p>
                            <p>Integration of Snowflake, Meek, and Obfs4 strategies to disguise Beam traffic as generic authorized traffic (like HTTPS or WebRTC) to bypass state-level firewalls.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-pink-500/10"><Radio className="w-4 h-4 text-pink-400" /></div>
                                Nostr Relay Signaling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Unstoppable Service Discovery.</p>
                            <p>Using the Nostr protocol as a censorship-resistant signaling layer for establishing initial P2P connections when central trackers are blocked.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Phase 5: Identity & Trust */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-cyan-400" />
                    Phase 5: Decentralized Identity (DID)
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-medium text-cyan-500">1</span>
                            <div>
                                <h4 className="font-medium text-white">Self-Sovereign Identity (SSI)</h4>
                                <p className="text-sm text-white/60">Attach Verifiable Credentials to tunnels. Allow "friend-only" access where the tunnel only opens for peers presenting a valid cryptographic DID token.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-medium text-cyan-500">2</span>
                            <div>
                                <h4 className="font-medium text-white">DIDComm Messaging</h4>
                                <p className="text-sm text-white/60">Secure, routing-agnostic communication between Beam nodes using the DIDComm standard, ensuring end-to-end encryption authenticated by DIDs.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Phase 6: Incentivized Infrastructure */}
            <section className="mb-16">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-amber-500" />
                    Phase 6: Incentivized Mixnets (DePIN)
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-amber-500/10"><Zap className="w-4 h-4 text-amber-400" /></div>
                                Bandwidth Micropayments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Sustainable Relays.</p>
                            <p>Experimental support for probabilistic micropayments (like HOPR or Nym credentials) to incentivize users to run high-bandwidth relays for the network.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <div className="p-1.5 rounded bg-amber-500/10"><Network className="w-4 h-4 text-amber-400" /></div>
                                DePIN Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-white/60 text-sm">
                            <p className="mb-2"><strong>Goal:</strong> Verified Edge Nodes.</p>
                            <p>Cryptographic proofs of bandwidth and uptime, allowing Beam nodes to participate in broader Decentralized Physical Infrastructure Networks as verifiable edge workers.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-medium text-white mb-2">Research & Contribution</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                            We are actively researching these technologies. If you have expertise in Rust, low-level networking, or cryptography, we'd love your help. Check out our <a href="https://github.com/byronwade/beam" className="underline text-white">GitHub </a> issues tagged with `roadmap`.
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}
