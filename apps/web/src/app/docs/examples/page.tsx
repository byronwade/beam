"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function ExamplesPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Examples</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          Practical examples showing how to use Beam in real-world development scenarios.
          These examples assume you have Beam installed and a local development server running.
        </p>
      </header>

      {/* Webhook Testing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Testing Webhooks</h2>

        <p className="text-white/70 mb-4">
          When integrating with services like Stripe, GitHub, or Twilio, you need a publicly
          accessible URL to receive webhook callbacks. Beam makes this simple without deploying
          to a server.
        </p>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">Stripe Webhook Example</h3>

        <p className="text-white/70 mb-4">
          First, create a simple webhook handler. Here's an example using Express:
        </p>

        <div className="mb-4">
          <CodeBlock
            code={`const express = require('express');
const app = express();

app.post('/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  console.log('Received webhook:', req.body.toString());

  // Process the webhook...

  res.status(200).send('OK');
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));`}
            language="javascript"
            filename="webhook-server.js"
          />
        </div>

        <p className="text-white/70 mb-4">
          Start your webhook server, then create a Beam tunnel:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="node webhook-server.js"
            language="bash"
          />
        </div>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --mode=private"
            language="bash"
            title="Terminal (new window)"
          />
        </div>

        <p className="text-white/70 mb-4">
          Beam outputs a .onion address. In Stripe's dashboard, configure your webhook endpoint as:
        </p>

        <p className="text-white/60 text-sm mb-4">
          💡 For faster webhook testing during development, use <InlineCode>--mode=balanced</InlineCode> for ~80-150ms latency instead of ~200-500ms with private mode.
        </p>

        <div className="mb-4">
          <CodeBlock
            code="http://your-onion-address.onion/webhook/stripe"
            language="output"
            title="Webhook URL"
            copyable={false}
          />
        </div>

        <p className="text-white/60 text-sm">
          Note: Some services may not support .onion addresses. For those, you'll need to use a
          service that bridges HTTP to Tor, or wait for Beam's upcoming public URL feature.
        </p>
      </section>

      {/* API Development */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">API Development</h2>

        <p className="text-white/70 mb-4">
          When building APIs, you often need to test from different devices or share your work
          with teammates. Beam's dual mode gives you both fast local access and remote accessibility.
        </p>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">REST API with Express</h3>

        <p className="text-white/70 mb-4">
          Suppose you're building an API server:
        </p>

        <div className="mb-4">
          <CodeBlock
            code={`# Your API runs on port 8080
npm run dev`}
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Create a tunnel with a custom domain for local testing and Tor for remote access:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 8080 --domain api.local --mode=balanced"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Now you can:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-4">
          <li>Test locally at <InlineCode>http://api.local:8080</InlineCode> with minimal latency</li>
          <li>Share the .onion address with teammates for testing (~80-150ms latency)</li>
          <li>Point mobile apps at the .onion address for device testing</li>
        </ul>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-emerald-400 mb-2">⚡ Need even faster local testing?</h4>
          <p className="text-white/70 text-sm mb-2">Use fast mode for direct P2P connections with ~30-50ms latency:</p>
          <CodeBlock code="beam 8080 --domain api.local --mode=fast" language="bash" />
        </div>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">Testing with curl</h3>

        <div className="mb-4">
          <CodeBlock
            code="curl http://api.local:8080/users"
            language="bash"
            title="Local testing"
          />
        </div>

        <div className="mb-4">
          <CodeBlock
            code="curl --socks5 localhost:9050 http://your-onion.onion/users"
            language="bash"
            title="Remote testing (via Tor)"
          />
        </div>
      </section>

      {/* Mobile App Development */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Mobile App Development</h2>

        <p className="text-white/70 mb-4">
          Testing mobile apps against a local backend is challenging because your phone can't
          access localhost. Beam solves this by providing a globally accessible URL.
        </p>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">React Native / Flutter Setup</h3>

        <p className="text-white/70 mb-4">
          Start your backend server and create a tunnel:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --mode=balanced --https"
            language="bash"
          />
        </div>

        <p className="text-white/60 text-sm mb-4">
          💡 Using <InlineCode>--mode=balanced</InlineCode> gives you ~80-150ms latency, which is acceptable for mobile development. For maximum privacy, use <InlineCode>--mode=private</InlineCode>.
        </p>

        <p className="text-white/70 mb-4">
          In your mobile app, configure the API base URL to use the .onion address. For React Native:
        </p>

        <div className="mb-4">
          <CodeBlock
            code={`// Development configuration
const API_BASE_URL = __DEV__
  ? 'http://your-onion-address.onion'  // Beam tunnel
  : 'https://api.production.com';       // Production

export { API_BASE_URL };`}
            language="javascript"
            filename="config.js"
          />
        </div>

        <p className="text-white/60 text-sm">
          Your mobile app will need Tor support to access .onion addresses. Consider using a
          library like Orbot for Android or configuring your app to route through Tor.
        </p>
      </section>

      {/* Team Collaboration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Team Collaboration</h2>

        <p className="text-white/70 mb-4">
          Share work-in-progress with teammates without deploying to a staging environment.
          This is especially useful for design reviews, QA testing, or client demonstrations.
        </p>

        <h3 className="text-lg font-medium text-white mb-3 mt-6">Sharing a Feature Branch</h3>

        <p className="text-white/70 mb-4">
          You're working on a new feature and want your teammate to test it:
        </p>

        <div className="mb-4">
          <CodeBlock
            code={`# Switch to your feature branch and start the dev server
git checkout feature/new-dashboard && npm run dev`}
            language="bash"
          />
        </div>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --mode=balanced"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Share the .onion address with your teammate. They can view your changes immediately
          in a Tor Browser without you pushing code or setting up a preview deployment.
          Balanced mode provides ~80-150ms latency for a responsive experience.
        </p>

        <p className="text-white/60 text-sm">
          Remember: The tunnel only works while Beam is running. Once you stop it, the
          .onion address becomes inaccessible.
        </p>
      </section>

      {/* Framework Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Framework Integration</h2>

        <p className="text-white/70 mb-4">
          Beam works with any framework that runs a local development server. Here are
          examples for popular frameworks:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Next.js</h3>
            <CodeBlock
              code={`npm run dev
# In another terminal:
beam 3000 --domain nextjs.local --mode=balanced`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Vite (Vue, React, Svelte)</h3>
            <CodeBlock
              code={`npm run dev
# In another terminal:
beam 5173 --domain vite.local --mode=balanced`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Django</h3>
            <CodeBlock
              code={`python manage.py runserver 8000
# In another terminal:
beam 8000 --domain django.local --mode=balanced`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Rails</h3>
            <CodeBlock
              code={`rails server
# In another terminal:
beam 3000 --domain rails.local --mode=balanced`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">FastAPI</h3>
            <CodeBlock
              code={`uvicorn main:app --reload
# In another terminal:
beam 8000 --domain fastapi.local --mode=balanced`}
              language="bash"
            />
          </div>
        </div>

        <p className="text-white/60 text-sm mt-4">
          💡 Use <InlineCode>--mode=fast</InlineCode> for maximum speed during local development, or <InlineCode>--mode=private</InlineCode> when sharing sensitive projects.
        </p>
      </section>

      {/* HTTPS for Development */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">HTTPS for Development</h2>

        <p className="text-white/70 mb-4">
          Some browser features require HTTPS, even in development. These include:
        </p>

        <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-4">
          <li>Service Workers and PWA features</li>
          <li>Secure cookies with SameSite=None</li>
          <li>Geolocation API</li>
          <li>WebRTC</li>
          <li>Clipboard API</li>
        </ul>

        <p className="text-white/70 mb-4">
          Use Beam's HTTPS mode to generate self-signed certificates:
        </p>

        <div className="mb-4">
          <CodeBlock
            code="beam 3000 --https --domain secure.local"
            language="bash"
          />
        </div>

        <p className="text-white/70 mb-4">
          Access your app at <InlineCode>https://secure.local</InlineCode>.
          Your browser will show a certificate warning—click through it to proceed.
        </p>

        <p className="text-white/60 text-sm">
          To avoid the warning in Chrome, you can add the generated certificate to your
          system's trust store. Certificates are stored in <InlineCode>~/.beam/certs/</InlineCode>.
        </p>
      </section>

      {/* Performance Optimization */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Performance Optimization</h2>

        <p className="text-white/70 mb-4">
          Beam offers several performance optimizations. Here are examples for different scenarios:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Maximum Speed (Local Development)</h3>
            <p className="text-white/70 text-sm mb-2">Use fast mode with caching for ~30-50ms latency:</p>
            <CodeBlock
              code={`beam 3000 --mode=fast --cache-size=200 --cache-ttl=600`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Optimized Global Access</h3>
            <p className="text-white/70 text-sm mb-2">Use balanced mode with prebuilt circuits and geographic optimization:</p>
            <CodeBlock
              code={`beam 3000 --mode=balanced --prebuild-circuits=5 --geo-prefer=US,CA,UK`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Maximum Privacy</h3>
            <p className="text-white/70 text-sm mb-2">Use private mode with extra circuits (no geographic preference to maximize anonymity):</p>
            <CodeBlock
              code={`beam 3000 --mode=private --prebuild-circuits=8`}
              language="bash"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Disable Caching (Real-time Data)</h3>
            <p className="text-white/70 text-sm mb-2">When serving real-time data, disable caching:</p>
            <CodeBlock
              code={`beam 3000 --mode=balanced --no-cache`}
              language="bash"
            />
          </div>
        </div>

        <p className="text-white/60 text-sm mt-4">
          For detailed performance tuning, see the{" "}
          <Link href="/docs/performance" className="text-white/80 underline hover:text-white">
            Performance Guide
          </Link>.
        </p>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Next Steps</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— All available commands and options
          </li>
          <li>
            <Link href="/docs/performance" className="text-white underline hover:text-white/80">
              Performance Guide
            </Link>
            {" "}— Optimize latency with caching, circuit prebuilding, and mode selection
          </li>
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— Understanding .onion addresses and Tor integration
          </li>
          <li>
            <Link href="/docs/troubleshooting" className="text-white underline hover:text-white/80">
              Troubleshooting
            </Link>
            {" "}— Solutions to common issues
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Have an example to share?{" "}
          <a href="https://github.com/byronwade/beam" className="text-white/70 underline hover:text-white" target="_blank" rel="noopener noreferrer">
            Contribute on GitHub
          </a>.
        </p>
      </footer>
    </article>
  );
}


