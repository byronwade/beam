"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Shield, Server, Globe, Code, Users, Radio, Lock, Wifi, Smartphone, Gauge, Network } from "lucide-react";
import { SupportSection } from "@/components/docs/support-section";

const features = [
    {
        title: "P2P Domain Registry",
        description: "Register domains that live in the distributed hash table. No central authority, no fees, no censorship.",
        icon: Network,
        color: "text-blue-400"
    },
    {
        title: "Tor Integration",
        description: "Built-in Tor instance creates hidden services on the fly. 100% anonymous routing with end-to-end encryption.",
        icon: Shield,
        color: "text-purple-400"
    },
    {
        title: "Local & Global Resolving",
        description: "One domain name (e.g. app.local) works on localhost and across the internet simultaneously.",
        icon: Globe,
        color: "text-green-400"
    },
    {
        title: "Zero Configuration",
        description: "Auto-detects your framework (Next.js, Vite, Astro, etc.) and forwards the correct port.",
        icon: Zap,
        color: "text-yellow-400"
    },
    {
        title: "Encrypted Tunnels",
        description: "Military-grade encryption for all traffic. Even we can't see what you're transmitting.",
        icon: Lock,
        color: "text-red-400"
    },
    {
        title: "Offline Capable",
        description: "Local resolution works even without internet access. Develop on a plane or train without breaking links.",
        icon: Wifi,
        color: "text-cyan-400"
    },
    {
        title: "Mobile Testing",
        description: "Test on any device instantly. Just scan a QR code or type the local domain.",
        icon: Smartphone,
        color: "text-pink-400"
    },
    {
        title: "Performance Modes",
        description: "Choose between Fast (P2P), Balanced, and Private (Tor) modes depending on your needs.",
        icon: Gauge,
        color: "text-orange-400"
    },
    {
        title: "Open Source",
        description: "MIT licensed. Audit the code, fork it, or contribute back. No vendor lock-in ever.",
        icon: Code,
        color: "text-white"
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <section className="relative py-24 px-6 border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 mb-8 rounded-full bg-white/5 border border-white/10">
                        <Radio className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Features
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        Everything you need to expose your local environment to the world, securely and effortlessly.
                    </p>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <Card key={feature.title} className="bg-[#111] border-white/10 hover:border-white/20 transition-all group">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-white/60 text-base leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-24 px-6 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-16">Why Beam?</h2>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">vs Ngrok</h3>
                            <ul className="space-y-2 text-white/60">
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Free custom domains</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited bandwidth</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No account required</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">vs Cloudflare</h3>
                            <ul className="space-y-2 text-white/60">
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Truly decentralized</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No central logging</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Self-contained CLI</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">vs Localhost</h3>
                            <ul className="space-y-2 text-white/60">
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Shareable URLs</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> SSL/TLS by default</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Webhook compatible</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 pb-24">
                <SupportSection />
            </div>
        </div>
    );
}
