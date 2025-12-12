"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function RemixGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Remix Integration</h1>
                <p className="text-xl text-white/60">
                    Full-stack tunneling for your Remix applications.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <p className="text-white/70">
                    Beam identifies Remix projects by checking for the <InlineCode>@remix-run/react</InlineCode> dependency.
                    Start your development session with:
                </p>
                <CodeBlock language="bash" code="npx beam dev" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Webhook Integration</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Remix is often used for building robust backends that handle webhooks from services like Stripe, GitHub, or Shopify.
                        Using Beam&apos;s <strong>Balanced Mode</strong> ensures you have a consistent onion address to register with these providers.
                    </p>
                    <div className="bg-[#111] p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-white/80 text-sm">
                            <strong>Tip:</strong> Unlike ngrok or other tools where the URL changes every time (unless you pay),
                            Beam allows you to generate a persistent address for free using your private key.
                        </p>
                    </div>
                    <CodeBlock language="bash" code="npx beam dev --mode=balanced" />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">3000</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Detection Command</span>
                            <span className="font-mono text-cyan-400">npm run dev</span>
                        </li>
                    </ul>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
