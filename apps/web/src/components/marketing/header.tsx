"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Github, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "Documentation", href: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60">
      <div className="w-full max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
            <Zap className="h-4 w-4 text-white group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-white/90">Beam</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden lg:flex text-white/60 hover:text-white">
            <Link href="https://github.com/byronwade" target="_blank">
              Support
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-white/80">
            <Link href="https://github.com/byronwade/beam" target="_blank">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="flex items-center justify-center md:hidden p-2 text-white/80 hover:bg-white/10 rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#0a0a0a] px-6 py-6 md:hidden absolute w-full left-0 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-medium transition-colors px-2 py-1 rounded-lg",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/60 active:text-white"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <Link
              href="https://github.com/byronwade/beam"
              className="flex items-center text-white/60 px-2"
              onClick={() => setMobileMenuOpen(false)}
              target="_blank"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub Repo
            </Link>
            <Link
              href="https://github.com/byronwade"
              className="flex items-center text-white/60 px-2"
              onClick={() => setMobileMenuOpen(false)}
              target="_blank"
            >
              Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
