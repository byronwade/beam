# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Open Source Release**: Complete rewrite as fully open source tunnel service
- **Self-Hosting Support**: Docker and docker-compose setup for easy deployment
- **AGPL-3.0 License**: Full open source licensing
- **Security Policy**: Comprehensive security reporting and handling procedures
- **Contributing Guidelines**: Development and contribution documentation
- **Docker Support**: Containerized deployment with nginx reverse proxy

### Changed
- **Architecture Overhaul**: Removed Cloudflare dependency, built custom tunnel server
- **Licensing**: Changed from proprietary to AGPL-3.0 open source license
- **Deployment Model**: From managed service to self-hosted with optional managed offering

### Removed
- **Cloudflare Integration**: Complete removal of Cloudflare Tunnel dependencies
- **Proprietary Components**: All proprietary code and services removed

## [1.1.27] - 2024-12-10

### Added
- Initial public release of Beam CLI
- Basic tunneling functionality with Cloudflare integration
- Web dashboard for tunnel management
- Request inspection and webhook testing features
- Framework integrations (Next.js, Vite, Astro, Remix)

### Changed
- Migrated from proprietary tunnel service to Cloudflare-based solution

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

### From Cloudflare-based to Self-hosted

If you're migrating from the previous Cloudflare-based version:

1. **Backup your data**: Export any important tunnel configurations
2. **Set up new infrastructure**: Deploy using Docker or manual installation
3. **Configure environment**: Update all environment variables
4. **Migrate data**: Import configurations to new system (manual process currently)
5. **Update CLI**: Use new CLI version with updated authentication

### Breaking Changes in 2.0.0

- Removed Cloudflare API integration
- Changed authentication system
- Updated CLI command structure
- Modified API endpoints
- New database schema requirements

---

For more information about releases, see the [GitHub Releases](https://github.com/byronwade/beam/releases) page.