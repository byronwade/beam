import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">Beam</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The open source tunnel manager for Cloudflare Tunnels. Self-host or use our managed service.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="transition-colors hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="https://github.com/byronwade/beam" className="transition-colors hover:text-foreground">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="https://github.com/byronwade/beam#readme" className="transition-colors hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#faq" className="transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="https://github.com/byronwade/beam/blob/main/LICENSE" className="transition-colors hover:text-foreground">
                  License (AGPLv3)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Beam. Open source under AGPLv3.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care by{" "}
            <Link href="https://byronwade.com" className="text-foreground underline-offset-4 hover:underline">
              Byron Wade
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
