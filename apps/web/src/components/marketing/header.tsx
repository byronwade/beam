"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Menu, X, Zap } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Beam</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="https://github.com/byronwade/beam" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            GitHub
          </Link>
          <Link href="https://github.com/byronwade" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Support
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="https://github.com/byronwade/beam">
              <Github className="mr-2 h-4 w-4" />
              View Source
            </Link>
          </Button>
        </div>

        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="#features" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link href="https://github.com/byronwade/beam" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              GitHub
            </Link>
            <Link href="https://github.com/byronwade" className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Support
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="ghost" asChild>
                <Link href="https://github.com/byronwade/beam" onClick={() => setMobileMenuOpen(false)}>
                  <Github className="mr-2 h-4 w-4" />
                  View Source
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
