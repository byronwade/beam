"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Check, Copy, ChevronDown, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { InlineCode } from "@/components/code-block";

function CommandBlock() {
  const [copied, setCopied] = useState(false);
  const command = "npx @byronwade/beam@latest init";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group cursor-pointer relative inline-flex items-center gap-3 rounded-xl bg-[#0a0a0a] px-5 py-3 font-mono text-sm transition-all border border-white/10 hover:border-white/20 overflow-hidden"
      aria-label={copied ? "Copied to clipboard" : "Click to copy command"}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-violet-500 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 via-green-500/10 via-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <span className="relative flex items-center gap-2">
        <span className="text-violet-400">$</span>
        <span className="text-amber-400">npx</span>
        <span className="text-emerald-400">@byronwade/beam@latest</span>
        <span className="text-cyan-400">init</span>
      </span>
      <span className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors" aria-hidden="true">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60" />
        )}
      </span>
    </button>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-[#0a0a0a] to-[#0a0a0a] opacity-50" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-8 hover:bg-white/10 transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            <span>.onion quick tunnels by default</span>
          </div>

          <h1 id="hero-heading" className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter mb-8">
            Global
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"> Localhost</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12">
            The private, free alternative to ngrok. Expose your local server directly to the world.
            <span className="block mt-2 text-white/80">No 3rd party relays. No data limits. Fully under your control.</span>
          </p>

          <div className="flex flex-col items-center gap-8">
            <CommandBlock />

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/docs">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5" asChild>
                <Link href="/how-it-works">
                  How it Works
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* Quick Value Props */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Direct & Fast</h3>
            <p className="text-white/50 leading-relaxed">
              Just run <InlineCode>npx beam dev</InlineCode>. Traffic flows directly from your device to the client. No middleman latency.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Private & Secure</h3>
            <p className="text-white/50 leading-relaxed">
              Your keys, your data. We don't see your traffic. Optional "Dark Mode" (Tor) available for anonymity.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Free Forever</h3>
            <p className="text-white/50 leading-relaxed">
              Since we don't host relays, we don't charge you. Unlimited bandwidth, unlimited usage. Truly free.
            </p>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="100%" label="Open Source" />
            <StatCard value="0" label="Middlemen" />
            <StatCard value="∞" label="Bandwidth" />
            <StatCard value="$0" label="Cost Forever" />
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/40 mb-6">Trusted by developers building on</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold text-white">Next.js</span>
              <span className="text-xl font-bold text-white">Vite</span>
              <span className="text-xl font-bold text-white">Astro</span>
              <span className="text-xl font-bold text-white">Remix</span>
              <span className="text-xl font-bold text-white">Nuxt</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to break free?</h2>
          <p className="text-xl text-white/50">
            Stop paying for tunnels. Stop sharing your data. Start Beaming.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full" asChild>
              <Link href="/docs">Start Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-white/10 hover:bg-white/5" asChild>
              <Link href="https://github.com/byronwade/beam">Star on GitHub</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
