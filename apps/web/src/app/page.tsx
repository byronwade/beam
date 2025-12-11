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
  const command = "Get started with Beam Dashboard";

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
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/docs" className="text-sm text-white/50 hover:text-white transition-colors relative group">
              Docs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="https://github.com/byronwade/beam" className="text-sm text-white/50 hover:text-white transition-colors relative group">
              GitHub
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5 hidden sm:flex" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="bg-white text-[#131313] hover:bg-white/90 hidden sm:flex" asChild>
              <Link href="/register">Get Started</Link>
            </Button>

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
                      Features
                    </Link>
                    <Link
                      href="#pricing"
                      className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
                      onClick={() => {
                        // Close sheet
                        (document.querySelector('[data-state="open"]') as HTMLElement)?.click();
                      }}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/docs"
                      className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
                      onClick={() => {
                        // Close sheet
                        (document.querySelector('[data-state="open"]') as HTMLElement)?.click();
                      }}
                    >
                      Docs
                    </Link>
                    <Link
                      href="https://github.com/byronwade/beam"
                      className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
                    >
                      GitHub
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 justify-start" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button className="bg-white text-[#131313] hover:bg-white/90 justify-start" asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
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
            Open Source
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight">
            Expose localhost
            <br />
            <span className="text-beam-rainbow">in seconds</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            The fastest way to share your local development server with the world.
            Zero config. One command. Like magic.
          </p>

          {/* Command block */}
          <div className="mt-12">
            <CommandBlock />
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-[#131313] hover:bg-white/90 px-8" asChild>
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5" asChild>
              <Link href="https://github.com/byronwade/beam">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-white/40 mt-1">Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1M+</div>
              <div className="text-sm text-white/40 mt-1">Tunnels created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-white/40 mt-1">Uptime</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* Demo Section */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Terminal mockup */}
          <div className="rounded-2xl bg-[#131313] border border-white/10 overflow-hidden shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
              </div>
              <span className="ml-2 text-xs text-white/40 font-mono">Terminal</span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white/40">→</span>
                <span className="text-white">Create tunnel in dashboard</span>
              </div>
              <div className="mt-4 space-y-1 text-white/60">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Tunnel established</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Ready to use</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-white/40">Public URL:</span>
                  <span className="ml-2 text-beam-rainbow">https://myapp.beam.dev</span>
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
              Everything you need
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Powerful features for developers who want more than just tunnels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              title="Request Inspector"
              description="Real-time HTTP viewer. See every request, response, and replay with one click."
            />
            <FeatureCard
              title="Webhook Capture"
              description="Perfect for webhook development. Capture, inspect, and replay from Stripe, GitHub, and more."
            />
            <FeatureCard
              title="Local HTTPS"
              description="Auto-provision trusted SSL certificates. Test HTTPS locally without warnings."
            />
            <FeatureCard
              title="Team Workspaces"
              description="Organize tunnels by project. Invite teammates with role-based access."
            />
            <FeatureCard
              title="Custom Domains"
              description="Use your own subdomain or bring your custom domain for permanent URLs."
            />
            <FeatureCard
              title="GitHub Integration"
              description="Auto-post tunnel URLs to PRs. Perfect for preview environments."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-[#131313]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Simple pricing
            </h2>
            <p className="mt-4 text-white/50">
              Free to start. Scale when you need to.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5">
              <div className="text-sm text-white/50">Free</div>
              <div className="mt-2 text-4xl font-bold text-white">$0</div>
              <div className="text-sm text-white/40">forever</div>
              <ul className="mt-8 space-y-3 text-sm text-white/60">
                <li>• Anonymous tunnels</li>
                <li>• Request inspector</li>
                <li>• QR code sharing</li>
              </ul>
              <Button variant="outline" className="w-full mt-8 border-white/10 text-white hover:bg-white/5" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>

            {/* Pro */}
            <div className="relative p-8 rounded-2xl bg-[#0a0a0a] border border-white/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-[#131313] text-xs font-medium">
                Popular
              </div>
              <div className="text-sm text-white/50">Pro</div>
              <div className="mt-2 text-4xl font-bold text-beam-rainbow">$9</div>
              <div className="text-sm text-white/40">per month</div>
              <ul className="mt-8 space-y-3 text-sm text-white/60">
                <li>• Everything in Free</li>
                <li>• 10 persistent tunnels</li>
                <li>• Reserved subdomains</li>
                <li>• Analytics dashboard</li>
              </ul>
              <Button className="w-full mt-8 bg-white text-[#131313] hover:bg-white/90" asChild>
                <Link href="/register">Start free trial</Link>
              </Button>
            </div>

            {/* Team */}
            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5">
              <div className="text-sm text-white/50">Team</div>
              <div className="mt-2 text-4xl font-bold text-white">$29</div>
              <div className="text-sm text-white/40">per month</div>
              <ul className="mt-8 space-y-3 text-sm text-white/60">
                <li>• Everything in Pro</li>
                <li>• Unlimited tunnels</li>
                <li>• Team workspaces</li>
                <li>• Priority support</li>
              </ul>
              <Button variant="outline" className="w-full mt-8 border-white/10 text-white hover:bg-white/5" asChild>
                <Link href="/register">Start free trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to beam?
          </h2>
          <p className="mt-4 text-white/50">
            Join thousands of developers shipping faster with Beam.
          </p>
          <div className="mt-8">
            <CommandBlock />
          </div>
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
              <Link href="https://github.com/byronwade/beam" className="hover:text-white transition-colors">
                GitHub
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Dashboard
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
