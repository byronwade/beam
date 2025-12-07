import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
              <svg className="h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-base font-medium text-foreground">Beam</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="https://github.com/byronwade/beam" className="text-sm text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Open Source
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Cloudflare Tunnel
              <br />
              <span className="text-muted-foreground">Command Center</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              A beautiful, real-time dashboard for managing your Cloudflare Tunnels.
              Bring your own keys, keep full control.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start 14 day free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/byronwade/beam">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground">beam.yourdomain.com</span>
              </div>
              <div className="p-6">
                {/* Mock Stats */}
                <div className="flex items-center gap-8 border-b border-border pb-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-foreground">3</span>
                      <span className="text-sm text-green-500">+20%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Active Tunnels</span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-foreground">12</span>
                      <span className="text-sm text-muted-foreground">-2%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Total Requests</span>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-foreground">99.9%</div>
                    <span className="text-sm text-muted-foreground">Uptime</span>
                  </div>
                </div>
                {/* Mock Chart Area */}
                <div className="mt-6 h-40 w-full rounded-lg bg-muted">
                  <svg className="h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path
                      d="M0,80 Q50,60 100,70 T200,50 T300,60 T400,40"
                      fill="none"
                      className="stroke-border"
                      strokeWidth="2"
                    />
                    <path
                      d="M0,70 Q50,50 100,60 T200,40 T300,50 T400,30"
                      fill="none"
                      className="stroke-blue-500"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Everything you need
              </h2>
              <p className="mt-3 text-muted-foreground">
                Powerful features that make tunnel management simple.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Real-time Updates",
                  description: "See tunnel status changes instantly with Convex's real-time sync.",
                },
                {
                  title: "BYOK Security",
                  description: "Your Cloudflare credentials are encrypted with AES-256.",
                },
                {
                  title: "Simple CLI",
                  description: "Start tunnels with one command: npx beam connect",
                },
                {
                  title: "Custom Domains",
                  description: "Map tunnels to any subdomain automatically.",
                },
                {
                  title: "Self-Hostable",
                  description: "Deploy to Vercel + Convex in minutes.",
                },
                {
                  title: "Open Source",
                  description: "AGPLv3 licensed. Audit, contribute, or fork.",
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-medium text-card-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Up and running in 3 steps
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                { step: "1", title: "Add API Token", description: "Create a Cloudflare token with Tunnel (Edit) and Account Settings (Read) permissions." },
                { step: "2", title: "Create Tunnel", description: "Choose a name and local port for your service." },
                { step: "3", title: "Run CLI", description: "Copy the command and run it locally." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-xl rounded-lg border border-border bg-primary p-4">
              <pre className="text-sm text-primary-foreground">
                <code>
                  <span className="text-primary-foreground/60">$</span> npx beam connect --tunnel abc123 --port 3000{"\n"}
                  <span className="text-green-400">✓</span> Connected to Cloudflare{"\n"}
                  <span className="text-green-400">✓</span> Tunnel active at api.yourdomain.com
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Simple pricing
              </h2>
              <p className="mt-3 text-muted-foreground">
                Free to self-host. Managed plans for teams.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {/* Self-hosted */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium text-card-foreground">Self-Hosted</h3>
                <p className="mt-1 text-sm text-muted-foreground">Deploy on your own</p>
                <div className="mt-4">
                  <span className="text-3xl font-semibold text-foreground">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {["Unlimited tunnels", "Full source code", "Community support"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-6 w-full" asChild>
                  <Link href="https://github.com/byronwade/beam">Clone on GitHub</Link>
                </Button>
              </div>

              {/* Pro */}
              <div className="relative rounded-xl border-2 border-primary bg-card p-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Popular
                </div>
                <h3 className="font-medium text-card-foreground">Pro</h3>
                <p className="mt-1 text-sm text-muted-foreground">For individuals</p>
                <div className="mt-4">
                  <span className="text-3xl font-semibold text-foreground">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {["Up to 10 tunnels", "Email support", "99.9% uptime SLA"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" asChild>
                  <Link href="/register">Start free trial</Link>
                </Button>
              </div>

              {/* Team */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium text-card-foreground">Team</h3>
                <p className="mt-1 text-sm text-muted-foreground">For organizations</p>
                <div className="mt-4">
                  <span className="text-3xl font-semibold text-foreground">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {["Unlimited tunnels", "5 team members", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-6 w-full" asChild>
                  <Link href="/register">Start free trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Ready to simplify your tunnels?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join developers who manage their Cloudflare Tunnels with Beam.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start 14 day free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">Beam</span>
          </div>
          <p className="text-sm text-muted-foreground">Open source tunnel management</p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/byronwade/beam" className="text-sm text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
