# Dependency License Audit

This document audits all dependencies used in Beam to ensure open source license compatibility.

## Audit Summary

**Status: ✅ PASS** - All dependencies are open source and compatible with AGPL-3.0

**Last Updated:** December 10, 2024
**Auditor:** Byron Wade

## License Compatibility Matrix

| License | AGPL-3.0 Compatible | Notes |
|---------|-------------------|-------|
| MIT | ✅ Yes | Most permissive open source license |
| Apache 2.0 | ✅ Yes | Compatible with GPL family |
| BSD | ✅ Yes | Compatible with GPL family |
| ISC | ✅ Yes | Compatible with GPL family |
| CC0 | ✅ Yes | Public domain equivalent |

## Web Dashboard Dependencies (`apps/web/package.json`)

### UI Libraries
| Package | Version | License | Status |
|---------|---------|---------|--------|
| @radix-ui/react-accordion | ^1.2.12 | MIT | ✅ Compatible |
| @radix-ui/react-alert-dialog | ^1.1.15 | MIT | ✅ Compatible |
| @radix-ui/react-aspect-ratio | ^1.1.8 | MIT | ✅ Compatible |
| @radix-ui/react-avatar | ^1.1.11 | MIT | ✅ Compatible |
| @radix-ui/react-checkbox | ^1.3.3 | MIT | ✅ Compatible |
| @radix-ui/react-collapsible | ^1.1.12 | MIT | ✅ Compatible |
| @radix-ui/react-context-menu | ^2.2.16 | MIT | ✅ Compatible |
| @radix-ui/react-dialog | ^1.1.15 | MIT | ✅ Compatible |
| @radix-ui/react-dropdown-menu | ^2.1.16 | MIT | ✅ Compatible |
| @radix-ui/react-hover-card | ^1.1.15 | MIT | ✅ Compatible |
| @radix-ui/react-label | ^2.1.8 | MIT | ✅ Compatible |
| @radix-ui/react-menubar | ^1.1.16 | MIT | ✅ Compatible |
| @radix-ui/react-navigation-menu | ^1.2.14 | MIT | ✅ Compatible |
| @radix-ui/react-popover | ^1.1.15 | MIT | ✅ Compatible |
| @radix-ui/react-progress | ^1.1.8 | MIT | ✅ Compatible |
| @radix-ui/react-radio-group | ^1.3.8 | MIT | ✅ Compatible |
| @radix-ui/react-scroll-area | ^1.2.10 | MIT | ✅ Compatible |
| @radix-ui/react-select | ^2.2.6 | MIT | ✅ Compatible |
| @radix-ui/react-separator | ^1.1.8 | MIT | ✅ Compatible |
| @radix-ui/react-slider | ^1.3.6 | MIT | ✅ Compatible |
| @radix-ui/react-slot | ^1.2.4 | MIT | ✅ Compatible |
| @radix-ui/react-switch | ^1.2.6 | MIT | ✅ Compatible |
| @radix-ui/react-tabs | ^1.1.13 | MIT | ✅ Compatible |
| @radix-ui/react-toggle | ^1.1.10 | MIT | ✅ Compatible |
| @radix-ui/react-toggle-group | ^1.1.11 | MIT | ✅ Compatible |
| @radix-ui/react-tooltip | ^1.2.8 | MIT | ✅ Compatible |

### Core Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| @auth/core | ^0.34.3 | MIT | ✅ Compatible |
| @hookform/resolvers | ^5.2.2 | MIT | ✅ Compatible |
| ably | ^2.1.0 | Apache-2.0 | ✅ Compatible |
| class-variance-authority | ^0.7.1 | MIT | ✅ Compatible |
| clsx | ^2.1.1 | MIT | ✅ Compatible |
| cmdk | ^1.1.1 | MIT | ✅ Compatible |
| convex | ^1.30.0 | Apache-2.0 | ✅ Compatible |
| date-fns | ^4.1.0 | MIT | ✅ Compatible |
| embla-carousel-react | ^8.6.0 | MIT | ✅ Compatible |
| framer-motion | ^12.23.25 | MIT | ✅ Compatible |
| input-otp | ^1.4.2 | MIT | ✅ Compatible |
| lucide-react | ^0.556.0 | MIT | ✅ Compatible |
| nanoid | ^5.1.6 | MIT | ✅ Compatible |
| next | 16.0.7 | MIT | ✅ Compatible |
| next-themes | ^0.4.6 | MIT | ✅ Compatible |
| react | 19.2.0 | MIT | ✅ Compatible |
| react-day-picker | ^9.12.0 | MIT | ✅ Compatible |
| react-dom | 19.2.0 | MIT | ✅ Compatible |
| react-hook-form | ^7.68.0 | MIT | ✅ Compatible |
| react-resizable-panels | ^3.0.6 | MIT | ✅ Compatible |
| recharts | ^2.15.4 | MIT | ✅ Compatible |
| sonner | ^2.0.7 | MIT | ✅ Compatible |
| tailwind-merge | ^3.4.0 | MIT | ✅ Compatible |
| vaul | ^1.1.2 | MIT | ✅ Compatible |
| zod | ^4.1.13 | MIT | ✅ Compatible |
| zustand | ^5.0.9 | MIT | ✅ Compatible |

### Development Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| @tailwindcss/postcss | ^4 | MIT | ✅ Compatible |
| @types/node | ^20 | MIT | ✅ Compatible |
| @types/react | ^19 | MIT | ✅ Compatible |
| @types/react-dom | ^19 | MIT | ✅ Compatible |
| @testing-library/jest-dom | ^6.6.3 | MIT | ✅ Compatible |
| @testing-library/react | ^16.2.0 | MIT | ✅ Compatible |
| @testing-library/user-event | ^14.5.2 | MIT | ✅ Compatible |
| eslint | ^9 | MIT | ✅ Compatible |
| eslint-config-next | 16.0.7 | MIT | ✅ Compatible |
| jsdom | ^25.0.1 | MIT | ✅ Compatible |
| tailwindcss | ^4 | MIT | ✅ Compatible |
| tw-animate-css | ^1.4.0 | MIT | ✅ Compatible |
| typescript | ^5 | Apache-2.0 | ✅ Compatible |
| vitest | ^2.1.4 | MIT | ✅ Compatible |

## CLI Dependencies (`packages/cli/package.json`)

### Runtime Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| ably | ^2.1.0 | Apache-2.0 | ✅ Compatible |
| chalk | ^5.3.0 | MIT | ✅ Compatible |
| clipboardy | ^5.0.1 | MIT | ✅ Compatible |
| commander | ^12.1.0 | MIT | ✅ Compatible |
| conf | ^13.0.1 | MIT | ✅ Compatible |
| convex | ^1.30.0 | Apache-2.0 | ✅ Compatible |
| dotenv | ^16.4.5 | BSD-2-Clause | ✅ Compatible |
| open | ^11.0.0 | MIT | ✅ Compatible |
| ora | ^8.1.1 | MIT | ✅ Compatible |
| qrcode-terminal | ^0.12.0 | MIT | ✅ Compatible |

### Development Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| @types/node | ^22.10.1 | MIT | ✅ Compatible |
| @types/qrcode-terminal | ^0.12.2 | MIT | ✅ Compatible |
| eslint | ^9 | MIT | ✅ Compatible |
| tsx | ^4.19.0 | MIT | ✅ Compatible |
| tsup | ^8.3.5 | MIT | ✅ Compatible |
| typescript | ^5.7.2 | Apache-2.0 | ✅ Compatible |
| vitest | ^2.1.4 | MIT | ✅ Compatible |

## Convex Dependencies (`convex/package.json`)

### Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| convex | ^1.30.0 | Apache-2.0 | ✅ Compatible |

### Development Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| typescript | ^5 | Apache-2.0 | ✅ Compatible |
| vitest | ^2.1.4 | MIT | ✅ Compatible |

## Root Dependencies (`package.json`)

### Development Dependencies
| Package | Version | License | Status |
|---------|---------|---------|--------|
| turbo | ^2.0.0 | MPL-2.0 | ✅ Compatible |

## License Verification Commands

To verify licenses manually, you can run:

```bash
# Check all licenses
npx license-checker --production --summary

# Check specific package
npm view <package-name> license

# Generate license report
npx license-checker --json > licenses.json
```

## AGPL-3.0 Compliance

All dependencies are compatible with AGPL-3.0 because:

1. **MIT/BSD/ISC Licenses**: These permissive licenses allow redistribution under any license, including AGPL-3.0
2. **Apache-2.0 License**: Compatible with GPL family licenses
3. **MPL-2.0 License**: Mozilla Public License 2.0 is compatible with GPL licenses

## Risk Assessment

- **High Risk**: None - All dependencies are well-established open source projects
- **Medium Risk**: None
- **Low Risk**: None - No proprietary or unknown license dependencies

## Recommendations

1. **Regular Audits**: Run license audits quarterly
2. **Dependency Updates**: Keep dependencies updated to latest versions
3. **Security Scanning**: Use tools like `npm audit` and Snyk for security vulnerabilities
4. **License Headers**: Ensure source files include appropriate license headers

## Conclusion

✅ **All dependencies pass the open source license audit and are fully compatible with AGPL-3.0 licensing.**
