# Beam Tunnels for VS Code

Expose your local development server to the internet with one click.

## Features

- **One-Click Tunnels**: Start a tunnel from the command palette or status bar
- **Status Bar Integration**: See active tunnels at a glance
- **QR Code Support**: Scan to access your tunnel on mobile devices
- **Clipboard Integration**: URLs are automatically copied when tunnels start
- **Multi-Tunnel Support**: Run multiple tunnels on different ports

## Usage

1. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Beam: Start Tunnel"
3. Enter the port number (default: 3000)
4. Your tunnel URL is copied to clipboard!

## Commands

| Command | Description |
|---------|-------------|
| `Beam: Start Tunnel` | Start a new tunnel on a specified port |
| `Beam: Stop Tunnel` | Stop an active tunnel |
| `Beam: Copy Tunnel URL` | Copy the tunnel URL to clipboard |
| `Beam: Show QR Code` | Display a QR code for mobile access |
| `Beam: Open Dashboard` | Open the Beam dashboard in browser |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `beam.defaultPort` | 3000 | Default port to expose |
| `beam.autoStart` | false | Auto-start tunnel when workspace opens |
| `beam.showStatusBar` | true | Show tunnel status in status bar |
| `beam.copyOnStart` | true | Copy URL to clipboard when tunnel starts |

## Requirements

- [Node.js](https://nodejs.org/) 18+
- The `@byronwade/beam` CLI will be installed automatically via npx

## Activity Bar

Look for the Beam icon in the activity bar to see all active tunnels. Click on a tunnel to copy its URL, or use the context menu to stop it.

## Building from Source

```bash
cd packages/vscode-extension
npm install
npm run compile
```

To package for distribution:

```bash
npm run package
```

## Links

- [Beam Dashboard](https://beam.byronwade.com)
- [CLI Documentation](https://npmjs.com/package/@byronwade/beam)
- [GitHub](https://github.com/byronwade/beam)
