"use client";

import { CodeBlock, InlineCode, Command } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function NextJSGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Next.js Integration</h1>
                <p className="text-xl text-white/60">
                    Seamlessly integrate Beam into your Next.js workflow for automatic tunneling.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Installation</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Install the Beam CLI and Next.js plugin:
                    </p>
                    <CodeBlock
                        language="bash"
                        code="npm install @byronwade/beam @byronwade/beam-next --save-dev"
                    />
                    <p className="text-white/70">
                        Or using bun/pnpm/yarn:
                    </p>
                    <CodeBlock
                        language="bash"
                        code="pnpm add -D @byronwade/beam @byronwade/beam-next"
                    />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Configuration</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Wrap your <InlineCode>next.config.js</InlineCode> with the Beam plugin. This will automatically start a tunnel when you run <InlineCode>next dev</InlineCode>.
                    </p>

                    <CodeBlock
                        language="javascript"
                        filename="next.config.js"
                        code={`const { withBeam } = require('@byronwade/beam-next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config
};

module.exports = withBeam(nextConfig, {
  enabled: process.env.NODE_ENV === 'development',
  port: 3000 // default
});`}
                    />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Usage</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Just run your development server as usual:
                    </p>
                    <CodeBlock language="bash" code="npm run dev" />
                    <p className="text-white/70">
                        You will see the Beam tunnel URL in your console output:
                    </p>
                    <CodeBlock
                        language="text"
                        code={`  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.5:3000
  ➜  Beam:    Initializing tunnel...
  ➜  Beam:    http://abcdef123456.onion
  ➜  Beam:    http://project-name.local`}
                    />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Persistent Domains</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Beam allows you to own your domain identity on the Tor network. By generating a keypair once and reusing it, your <InlineCode>.onion</InlineCode> address remains the same across restarts.
                    </p>
                    <p className="text-white/70">
                        For Next.js projects, this means you can configure webhooks (e.g. Stripe, GitHub) to point to your stable onion address and never have to update them again during development.
                    </p>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
