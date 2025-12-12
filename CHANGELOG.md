# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Decentralized Architecture**: Fully local-first tunnel service with no cloud dependencies
- **Rust Tunnel Daemon**: High-performance HTTP/HTTPS proxy daemon
- **HTTPS Support**: Self-signed certificate generation for local development
- **Tor Integration**: Optional Tor hidden services for global webhook access
- **Context-Aware Routing**: Same domain works locally and globally
- **AGPL-3.0 License**: Full open source licensing
- **Security Policy**: Comprehensive security reporting and handling procedures
- **Contributing Guidelines**: Development and contribution documentation

### Changed
- **Architecture Overhaul**: Complete rewrite as fully decentralized, local-first system
- **Licensing**: Changed from proprietary to AGPL-3.0 open source license
- **Deployment Model**: No deployment needed - runs entirely on user's machine

### Removed
- **Cloud Infrastructure**: Removed all cloud dependencies (Cloudflare, Convex, Ably)
- **Proprietary Components**: All proprietary code and services removed

## [1.1.27] - 2024-12-10

### Added
- Initial public release of Beam CLI
- Basic tunneling functionality
- Request inspection and webhook testing features
- Framework integrations (Next.js, Vite, Astro, Remix)

### Fixed
- Various stability and performance improvements

## [1.0.0] - 2024-01-15

### Added
- Initial concept and prototype
- Basic tunneling capabilities
- Command-line interface
- Web-based management dashboard

---

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities

## Versioning Policy

Beam follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Release Schedule

- **Patch releases**: As needed for bug fixes and security updates
- **Minor releases**: Monthly for new features and improvements
- **Major releases**: When breaking changes are required

## Support Policy

- **Latest version**: Full support with bug fixes and security updates
- **Previous version**: Security updates only for 6 months after new major release
- **End of Life**: Versions older than 12 months may no longer receive updates

## Migration Guide

### From 1.x to 2.0 (Decentralized)

If you're migrating from the previous version:

1. **Update CLI**: Install the latest version: `npm install -g @byronwade/beam`
2. **No Configuration Needed**: The new version runs entirely locally
3. **HTTPS Support**: Use `--https` flag for HTTPS tunnels
4. **Tor for Webhooks**: Use `--dual` flag for global webhook access via Tor

### Breaking Changes in 2.0.0

- Removed all cloud dependencies
- No account/login required
- Simplified CLI interface
- Local-only by default (Tor optional for webhooks)

---

For more information about releases, see the [GitHub Releases](https://github.com/byronwade/beam/releases) page.



