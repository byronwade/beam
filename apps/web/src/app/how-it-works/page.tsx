"use client";

import { Metadata } from 'next';
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Globe, Webhook, Laptop, Server, HelpCircle, Shield, Network } from "lucide-react";
import { InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <section className="relative py-24 px-6 border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 mb-8 rounded-full bg-white/5 border border-white/10">
                        <Network className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        How Beam Works
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        A deep dive into P2P domain resolution, Tor hidden services, and how Beam connects your local machine to the world securely.
                    </p>
                </div>
            </section>

            {/* Core Concept */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white">One Domain, Multi-Context Resolution</h2>
                            <p className="text-white/60 leading-relaxed">
                                The core magic of Beam is its ability to make a single domain name, like <InlineCode>project.local</InlineCode>, resolve differently depending on <strong>who</strong> is asking.
                            </p>
                            <p className="text-white/60 leading-relaxed">
                                We call this "Context-Aware Resolution." It eliminates the need to manage different URLs for local dev, staging, and public access.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 mt-1">
                                        <Monitor className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">On Your Machine</h3>
                                        <p className="text-sm text-white/50">Resolves to <span className="font-mono text-cyan-400">127.0.0.1</span>. Zero latency, direct local access.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 mt-1">
                                        <Globe className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">On the Internet</h3>
                                        <p className="text-sm text-white/50">Resolves to a <span className="font-mono text-green-400">.onion</span> address. Routes through Tor.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            {/* Diagram Placeholder - pure CSS representation */}
                            <div className="rounded-2xl border border-white/10 bg-[#111] p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                                <div className="relative z-10 flex flex-col items-center gap-8">
                                    <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                        <span className="text-sm text-white/40 block mb-1">Request for</span>
                                        <span className="font-mono text-lg text-white font-bold">app.local</span>
                                    </div>

                                    <div className="w-0.5 h-12 bg-gradient-to-b from-white/20 to-transparent" />

                                    <div className="grid grid-cols-2 gap-8 w-full">
                                        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center">
                                            <p className="text-blue-400 font-medium mb-2">Local</p>
                                            <p className="font-mono text-white/60 text-sm">127.0.0.1</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
                                            <p className="text-green-400 font-medium mb-2">Public</p>
                                            <p className="font-mono text-white/60 text-sm">xyz.onion</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-16 text-center">The Architecture</h2>

                    <div className="grid gap-12">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-mono font-bold text-primary text-xl">1</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Discovery & Registration</h3>
                                <p className="text-white/60 leading-relaxed mb-4">
                                    When you run <InlineCode>beam dev</InlineCode>, Beam generates a cryptographic key pair. It then announces your presence to the Beam Distributed Hash Table (DHT), a decentralized network of peers.
                                </p>
                                <Card className="bg-[#0a0a0a] border-white/10">
                                    <CardContent className="p-4 font-mono text-sm text-white/70">
                                        <span className="text-purple-400">{">"}</span> Generating RSA-1024 key pair...<br />
                                        <span className="text-purple-400">{">"}</span> Announcing to DHT...<br />
                                        <span className="text-green-400">{">"}</span> Registered: [Your-Key-ID]
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-mono font-bold text-primary text-xl">2</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Tor Circuit Establishment</h3>
                                <p className="text-white/60 leading-relaxed mb-4">
                                    Beam spins up an embedded Tor instance (so you don't need Tor installed). It establishes a Hidden Service Version 3, which creates a rendezvous point in the Tor network.
                                </p>
                                <p className="text-white/60 leading-relaxed">
                                    This rendezvous point allows inbound traffic without you ever needing to open a port on your router. <strong>No port forwarding. No firewall config.</strong>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-mono font-bold text-primary text-xl">3</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Traffic Routing</h3>
                                <p className="text-white/60 leading-relaxed mb-4">
                                    When an external user accesses your Beam address:
                                </p>
                                <ol className="list-decimal list-inside text-white/60 space-y-2 ml-2">
                                    <li>The request enters the Tor network.</li>
                                    <li>Tor routes it anonymously to your rendezvous point.</li>
                                    <li>Beam receives the stream, decrypts it, and proxies it to your local <InlineCode>localhost:3000</InlineCode>.</li>
                                    <li>The response follows the same path back, fully encrypted.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>

                    <div className="space-y-6">
                        <Card className="bg-[#111] border-white/10">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    Is it truly private?
                                </h3>
                                <p className="text-white/60">
                                    Yes. Unlike other tunnel services that decrypt your traffic at their servers, Beam uses Tor's end-to-end encryption. The traffic is encrypted from the client all the way to your laptop. No one in the middle (not even us) can see the data.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111] border-white/10">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-blue-400" />
                                    Do I need Tor installed?
                                </h3>
                                <p className="text-white/60">
                                    No. Beam comes with an embedded Tor daemon. It runs entirely in userspace and cleans up after itself when you exit.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111] border-white/10">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-yellow-400" />
                                    What about performance?
                                </h3>
                                <p className="text-white/60">
                                    Tor is slower than direct internet connections due to the 3-hop circuit. Expect latencies around 200ms-500ms. For purely local development (P2P mode), it's instant. For real-time apps requiring sub-100ms latency, we offer a "Fast Mode" that skips Tor but sacrifices some anonymity.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 pb-24">
                <SupportSection />
            </div>
        </div>
    );
}
