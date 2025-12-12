"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Header } from "@/components/marketing/header";

function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden="true">
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
        <circle cx="16" cy="16" r="15" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
        <path d="M 16 1 A 15 15 0 0 1 16 31" fill="white" />
        <path d="M 16 1 A 15 15 0 0 0 16 31" fill="white" />
        <circle cx="16" cy="16" r="14" fill="url(#rainbowGrad)" clipPath="url(#bottomHalf)" />
        <path d="M 16 2 A 14 14 0 0 0 2 16 L 30 16 A 14 14 0 0 0 16 2" fill="white" />
      </svg>
    </div>
  );
}

function AlphaBanner() {
  return (
    <aside
      className="sticky top-16 z-40 w-full h-12 flex items-center border-b border-amber-500/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-md"
      aria-label="Alpha notice"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-amber-200 uppercase tracking-widest">Alpha</span>
          </div>
          <span className="hidden sm:block h-3 w-px bg-amber-500/30" aria-hidden="true" />
          <p className="text-sm text-amber-100/80">
            Beam is currently in active development.{" "}
            <Link
              href="https://github.com/byronwade/beam/issues"
              className="text-amber-200 hover:text-amber-100 underline underline-offset-2 transition-colors"
            >
              Report bugs
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Beam - Home">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-medium text-white">Beam</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-white/40" aria-label="Footer navigation">
            <Link href="/features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="https://github.com/byronwade/beam" className="hover:text-white transition-colors">
              GitHub
            </Link>
          </nav>

          <p className="text-sm text-white/30">
            <time dateTime="2024">&copy; 2024</time> Beam. Open source under MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <AlphaBanner />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}



