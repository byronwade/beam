"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, Github, Copy, Check, ChevronDown, Menu, X } from "lucide-react";

// Beam Logo - Split circle with gradient
function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="25%" stopColor="#FF7F00" />
            <stop offset="50%" stopColor="#FFFF00" />
            <stop offset="75%" stopColor="#00FF00" />
            <stop offset="100%" stopColor="#0000FF" />
          </linearGradient>
          <clipPath id="bottomHalf">
            <rect x="1" y="16" width="30" height="15" />
          </clipPath>
        </defs>

        {/* Outer circle stroke */}
        <circle cx="16" cy="16" r="15" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />

        {/* Top half - white fill */}
        <path d="M 16 1 A 15 15 0 0 1 16 31" fill="white" />
        <path d="M 16 1 A 15 15 0 0 0 16 31" fill="white" />

        {/* Bottom half - rainbow gradient */}
        <circle cx="16" cy="16" r="14" fill="url(#rainbowGrad)" clipPath="url(#bottomHalf)" />

        {/* Top half white overlay */}
        <path d="M 16 2 A 14 14 0 0 0 2 16 L 30 16 A 14 14 0 0 0 16 2" fill="white" />
      </svg>
    </div>
  );
}

// Animated command with copy functionality
function CommandBlock() {
  const [copied, setCopied] = useState(false);
  const command = "npx @byronwade/beam 3000 --tor";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className="group cursor-pointer inline-flex items-center gap-3 rounded-full bg-[#131313] px-5 py-3 font-mono text-sm transition-all hover:bg-[#1a1a1a]"
    >
      <span className="text-white">{command}</span>
      <div className="flex items-center justify-center w-5 h-5 rounded bg-white/10 group-hover:bg-white/20 transition-colors">
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-white/60" />
        )}
      </div>
    </div>
  );
}



// Feature card
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-[#131313] border border-white/5 hover:border-white/10 transition-all">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-semibold text-white">Beam</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-white/50 hover:text-white transition-colors relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/docs" className="text-sm text-white/50 hover:text-white transition-colors relative group">
              Technical Docs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="https://github.com/byronwade" className="text-sm text-white/50 hover:text-white transition-colors relative group">
              Support
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white/70 hover:text-white hover:bg-white/5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#131313] border-white/10 text-white w-80">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Logo className="h-6 w-6" />
                    <span className="text-lg font-semibold">Beam</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Link
                      href="#features"
                      className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
                      onClick={() => {
                        // Close sheet
                        (document.querySelector('[data-state="open"]') as HTMLElement)?.click();
                      }}
                    >
                      How It Works
                    </Link>
                    <Link
                      href="/docs"
                      className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
                      onClick={() => {
                        // Close sheet
                        (document.querySelector('[data-state="open"]') as HTMLElement)?.click();
                      }}
                    >
                      Technical Docs
                    </Link>
                    <Link
                      href="https://github.com/byronwade"
                      className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
                    >
                      Support
                    </Link>
                  </div>

                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section - Extra Large */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#131313]" />

        {/* Very subtle rainbow gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            Decentralized & Open Source
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight">
            Decentralized
            <br />
            <span className="text-beam-rainbow">Tor Tunneling</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Self-hosted tunneling that uses Tor hidden services and P2P networking.
            Register domains like <code className="text-beam-rainbow">byronwade.local</code> that work
            both locally (127.0.0.1) and globally (Tor .onion) - same domain, everywhere.
          </p>

          {/* Command block */}
          <div className="mt-12">
            <CommandBlock />
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex items-center justify-center">
            <Button size="lg" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5" asChild>
              <Link href="https://github.com/byronwade/beam">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Network Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-sm text-white/40 mt-1">Central Servers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-sm text-white/40 mt-1">Network Scalability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm text-white/40 mt-1">Privacy by Design</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How Decentralized Tunneling Works
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              No central servers. No accounts. Just you, Tor, and the P2P network.
            </p>
          </div>

          {/* Domain Resolution Magic */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">One Domain, Two Worlds</h3>
              <p className="text-white/60">The same domain name works everywhere, automatically</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20 p-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-beam-rainbow mb-2">byronwade.local</div>
                <p className="text-white/80">One domain name → Multiple resolution contexts</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="rounded-xl bg-[#131313] border border-white/10 p-4">
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-white font-medium mb-1">Local Browser</div>
                <div className="text-white/60 text-sm">byronwade.local</div>
                <div className="text-primary text-sm font-mono">→ 127.0.0.1</div>
              </div>
              <div className="rounded-xl bg-[#131313] border border-white/10 p-4">
                <div className="text-2xl mb-2">🌐</div>
                <div className="text-white font-medium mb-1">External Services</div>
                <div className="text-white/60 text-sm">byronwade.local</div>
                <div className="text-green-400 text-sm font-mono">→ abc123.onion</div>
              </div>
              <div className="rounded-xl bg-[#131313] border border-white/10 p-4">
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-white font-medium mb-1">APIs & Webhooks</div>
                <div className="text-white/60 text-sm">byronwade.local</div>
                <div className="text-purple-400 text-sm font-mono">→ P2P Resolution</div>
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Local Development</h3>
              <div className="rounded-2xl bg-[#131313] border border-white/10 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">💻</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Your Local Machine</p>
                      <p className="text-white/60 text-sm">localhost:3000 running</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-primary/30 pl-6 space-y-2">
                    <p className="text-white/80 text-sm">• Beam creates Tor hidden service</p>
                    <p className="text-white/80 text-sm">• Generates .onion address</p>
                    <p className="text-white/80 text-sm">• Registers name in P2P DHT</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Global Access</h3>
              <div className="rounded-2xl bg-[#131313] border border-white/10 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 text-sm">🌐</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">External Services</p>
                      <p className="text-white/60 text-sm">Webhooks, APIs, browsers</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-green-400/30 pl-6 space-y-2">
                    <p className="text-white/80 text-sm">• P2P network resolves your domain</p>
                    <p className="text-white/80 text-sm">• Traffic routes through Tor</p>
                    <p className="text-white/80 text-sm">• Direct connection, no middlemen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Demo */}
          <div className="rounded-2xl bg-[#131313] border border-white/10 overflow-hidden shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
              </div>
              <span className="ml-2 text-xs text-white/40 font-mono">Beam CLI</span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white/40">$</span>
                <span className="text-white">beam register byronwade.local</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white/40">$</span>
                <span className="text-white">beam 3000 --dual-access</span>
              </div>
              <div className="space-y-1 text-white/60 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Domain registered in P2P network</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Tor hidden service created</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Context-aware DNS configured</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="text-center text-white/60 text-xs mb-2">Same domain, different contexts:</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-blue-400 font-medium">Local Browser</div>
                    <div className="text-white/60">byronwade.local</div>
                    <div className="text-primary font-mono">→ 127.0.0.1:3000</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-medium">External Services</div>
                    <div className="text-white/60">byronwade.local</div>
                    <div className="text-beam-rainbow font-mono">→ abc123.onion</div>
                  </div>
                </div>
                <div className="text-center text-white/40 text-xs mt-3">
                  Webhooks, APIs, and external services automatically resolve to Tor
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Decentralized by Design
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Every feature is built around the principles of decentralization, privacy, and user sovereignty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              title="Smart Domain Resolution"
              description="One domain name works everywhere. byronwade.local resolves to localhost locally, Tor .onion globally. Context-aware DNS magic."
            />
            <FeatureCard
              title="Tor Hidden Services"
              description="Your local apps become globally accessible through Tor .onion addresses. No central servers, no IP leaks, military-grade anonymity."
            />
            <FeatureCard
              title="P2P Domain Registry"
              description="Decentralized domain name system using Kademlia DHT. Register domains across the peer network with cryptographic signatures."
            />
            <FeatureCard
              title="End-to-End Encryption"
              description="All traffic is encrypted from your machine through Tor to the destination. No man-in-the-middle attacks possible."
            />
            <FeatureCard
              title="Self-Sovereign Identity"
              description="No accounts, no logins, no data collection. You own your tunnels and your data completely. Pure peer-to-peer."
            />
            <FeatureCard
              title="Local-First Architecture"
              description="Everything runs on your machine. SQLite database for configuration, no cloud dependencies, complete data sovereignty."
            />
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Take Back Control
          </h2>
          <p className="mt-4 text-white/50">
            Stop relying on centralized tunneling services. Own your connections, own your data.
            Use your own domain names everywhere.
          </p>
          <div className="mt-8">
            <CommandBlock />
          </div>
          <p className="mt-6 text-sm text-white/30">
            No accounts • No tracking • No middlemen • Just decentralized tunneling
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        {/* Footer content */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              <span className="text-sm font-medium text-white">Beam</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="https://github.com/byronwade" className="hover:text-white transition-colors">
                Support
              </Link>
              <Link href="https://github.com/byronwade/beam" className="hover:text-white transition-colors">
                GitHub
              </Link>
            </div>

            <div className="text-sm text-white/30">
              © 2024 Beam
            </div>
          </div>
        </div>

        {/* Rainbow bar at bottom */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF0000] via-[#FF7F00] via-[#FFFF00] via-[#00FF00] via-[#0000FF] to-transparent opacity-50" />
      </footer>
    </div>
  );
}
