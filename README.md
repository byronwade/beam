# Beam

<div align="center">
  <h3>The Open Source Tunnel Manager</h3>
  <p>A beautiful, real-time Command Center for Cloudflare Tunnels</p>

  [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/byronwade/beam)
</div>

---

## What is Beam?

Beam is a **BYOK (Bring Your Own Keys)** wrapper around Cloudflare's Tunnel API. It provides:

- A beautiful dashboard to create, monitor, and manage your Cloudflare Tunnels
- Real-time status updates powered by Convex
- A simple CLI to connect tunnels to your local services
- End-to-end encryption for your Cloudflare API keys

Think of it as a self-hostable alternative to ngrok, but using Cloudflare's network.

## Features

- **Real-time Updates**: See tunnel status changes instantly without refreshing
- **BYOK Security**: Your Cloudflare keys are encrypted with AES-256-GCM
- **Simple CLI**: Start tunnels with `npx beam connect`
- **Custom Domains**: Map tunnels to any subdomain on your Cloudflare domain
- **Self-Hostable**: Deploy to Vercel + Convex in minutes
- **Open Source**: AGPLv3 licensed - audit, contribute, or fork

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Backend/Database**: Convex (real-time sync, serverless functions)
- **Auth**: Custom authentication with encrypted sessions
- **Styling**: Tailwind CSS + shadcn/ui
- **Infrastructure**: Cloudflare API (v4)

## Quick Start

### Prerequisites

- Node.js 18+
- A Cloudflare account with a domain
- A Convex account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/byronwade/beam.git
cd beam
npm install
```

### 2. Set Up Convex

```bash
npx convex dev
```

This will prompt you to:
1. Create a new Convex project
2. Set up your deployment

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Security (CRITICAL - generate a random 32+ character string)
DATA_ENCRYPTION_KEY="your-super-secret-encryption-key-here"
```

Generate a secure encryption key:

```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Cloudflare Setup

### Creating an API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Select "Create Custom Token"
4. Add these permissions:
   - **Account** - Cloudflare Tunnel - Edit
   - **Zone** - DNS - Edit (for custom domains)
5. Copy the token and add it to Beam's Settings page

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                    (Next.js Dashboard)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (Real-time sync)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          Convex                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Queries    │  │  Mutations   │  │   Actions    │      │
│  │ (Real-time)  │  │  (Database)  │  │ (Cloudflare) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                              │                               │
│                    ┌──────────────────┐                     │
│                    │     Database     │                     │
│                    │ (users, tunnels, │                     │
│                    │   credentials)   │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Encrypted)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare API                           │
│              (Tunnel & DNS Management)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Network                         │
│                    (Traffic Routing)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Secure tunnel
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    User's Machine                            │
│                  (npx beam connect)                          │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
beam/
├── convex/                   # Backend (Convex)
│   ├── schema.ts            # Database schema
│   ├── auth.ts              # Authentication logic
│   ├── tunnels.ts           # Tunnel queries/mutations
│   ├── cloudflareKeys.ts    # Cloudflare API actions
│   └── lib/
│       ├── crypto.ts        # Encryption utilities
│       └── cloudflare.ts    # Cloudflare API wrapper
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Landing page
│   │   ├── (auth)/          # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (dashboard)/     # Dashboard pages
│   │       └── dashboard/
│   │           ├── page.tsx
│   │           ├── tunnels/
│   │           └── settings/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── marketing/       # Landing page components
│   └── lib/                 # Utilities
│       ├── convex.tsx       # Convex provider
│       └── auth-context.tsx # Auth context
└── public/                  # Static assets
```

## Database Schema

### users
- `email`: string (unique)
- `name`: string (optional)
- `passwordHash`: string
- `createdAt`: number

### cloudflare_keys
- `userId`: reference to users
- `accountId`: string (Cloudflare Account ID)
- `encryptedToken`: string (AES-256-GCM encrypted)
- `iv`: string (initialization vector)
- `isVerified`: boolean

### tunnels
- `userId`: reference to users
- `tunnelId`: string (Cloudflare tunnel UUID)
- `name`: string (subdomain)
- `status`: "active" | "inactive" | "pending"
- `port`: number
- `lastHeartbeat`: number

## CLI Usage

Once your tunnel is created in the dashboard, connect it using the CLI:

```bash
# Connect to a tunnel
npx beam connect --tunnel <tunnel-id> --port <local-port>

# Example
npx beam connect --tunnel abc123 --port 3000
```

The CLI will:
1. Authenticate with your Beam instance
2. Fetch the tunnel configuration
3. Start the cloudflared connector
4. Forward traffic from your public URL to localhost

## Security

### Encryption
- All Cloudflare API tokens are encrypted with AES-256-GCM before storage
- Encryption keys are stored as environment variables, never in the database
- Tokens are only decrypted server-side when making Cloudflare API calls

### Authentication
- Passwords are hashed with SHA-256 + random salt
- Sessions use secure random tokens with 7-day expiry
- All API routes require valid session tokens

### Best Practices
- Generate a strong `DATA_ENCRYPTION_KEY` (32+ characters)
- Use environment variables, never commit secrets
- Rotate your Cloudflare API token periodically
- Enable 2FA on your Cloudflare account

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `DATA_ENCRYPTION_KEY`
4. Deploy!

### Self-Hosted

Beam can run anywhere Next.js runs. You'll need to:
1. Set up Convex (works with any hosting)
2. Configure environment variables
3. Run `npm run build && npm start`

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development

```bash
# Install dependencies
npm install

# Start Convex backend
npx convex dev

# Start Next.js (in another terminal)
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## License

Beam is licensed under the [GNU Affero General Public License v3.0](LICENSE).

**TL;DR**: You can use, modify, and distribute Beam. If you modify it and offer it as a service, you must open-source your changes.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/byronwade/beam/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/byronwade/beam/discussions)
- **Email**: support@byronwade.com

---

<div align="center">
  <p>Made with care by <a href="https://byronwade.com">Byron Wade</a></p>
  <p>
    <a href="https://github.com/byronwade/beam">GitHub</a> •
    <a href="https://beam.byronwade.com">Website</a> •
    <a href="https://twitter.com/byronwade">Twitter</a>
  </p>
</div>
