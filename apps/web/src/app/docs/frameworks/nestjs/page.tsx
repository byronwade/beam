"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function NestJSGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">NestJS Integration</h1>
                <p className="text-xl text-white/60">
                    Expose your NestJS APIs securely for webhook testing and mobile development.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <p className="text-white/70">
                    Beam automatically detects NestJS. Start your dev tunnel with:
                </p>
                <CodeBlock language="bash" code="npx beam dev" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Webhook Development</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        NestJS is commonly used for backend APIs. Use <strong>Balanced Mode</strong> to get a stable onion address
                        for testing 3rd-party webhooks (Stripe, Twilio, Slack) without deploying to staging.
                    </p>
                    <div className="bg-[#111] p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-white/80 text-sm">
                            <strong>Note:</strong> Since NestJS apps are often purely APIs, consider using tools like Postman
                            configured to use the Beam tunnel proxy if you need to inspect request flows manually.
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
                            <span className="font-mono text-cyan-400">npm run start:dev</span>
                        </li>
                    </ul>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
