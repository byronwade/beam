# Contributing to Beam

Thank you for your interest in contributing to Beam! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A [Convex](https://convex.dev) account (free tier works)
- (Optional) Docker for containerized development

### Quick Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/beam.git
   cd beam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the development environment**
   ```bash
   # Set up Convex (backend)
   npx convex dev

   # In another terminal, start the web dashboard
   npm run dev:web

   # In another terminal, start the tunnel server (when implemented)
   npm run dev:tunnel-server
   ```

## Project Structure

```
beam/
├── apps/
│   └── web/                 # Next.js dashboard application
├── packages/
│   ├── cli/                 # Command-line interface
│   └── tunnel-server/       # Tunnel server (to be implemented)
├── convex/                  # Convex backend functions
├── packages.json            # Workspace configuration
├── turbo.json              # Build system configuration
└── README.md               # Project documentation
```

### Key Directories

- **`apps/web/`**: The web dashboard for managing tunnels
- **`packages/cli/`**: The command-line tool users install
- **`packages/tunnel-server/`**: The server that handles tunneling (planned)
- **`convex/`**: Backend functions and database schema

## Development Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Tunnel Server (when implemented)
TUNNEL_SERVER_PORT=3001
TUNNEL_SERVER_HOST=localhost

# Ably for real-time messaging
ABLY_SECRET_KEY=your-ably-secret-key

# Encryption key for sensitive data
DATA_ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

### Development Commands

```bash
# Install dependencies
npm install

# Start Convex backend
npx convex dev

# Start web dashboard
npm run dev:web

# Build CLI for testing
cd packages/cli && npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Contributing Guidelines

### Types of Contributions

- **Bug fixes**: Fix issues in existing code
- **Features**: Add new functionality
- **Documentation**: Improve docs, add examples
- **Tests**: Add or improve test coverage
- **Infrastructure**: Docker, CI/CD, build improvements

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is enforced
- **Conventional Commits**: Use conventional commit format

### Commit Messages

Use conventional commit format:

```bash
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```bash
feat(cli): add support for custom subdomains
fix(web): resolve tunnel status display issue
docs(readme): update installation instructions
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- packages/cli/src/index.test.ts
```

### Writing Tests

- Use Vitest for testing framework
- Write tests for new features and bug fixes
- Aim for good test coverage (>80%)
- Test both happy path and error cases

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Tunnel CLI', () => {
  it('should start tunnel successfully', async () => {
    // Test implementation
  });

  it('should handle invalid port', async () => {
    // Test error handling
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Run quality checks**
   ```bash
   npm run lint
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Request review from maintainers

### PR Requirements

- [ ] Tests pass
- [ ] Code is linted
- [ ] Documentation updated
- [ ] Conventional commit messages
- [ ] PR description explains the change

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Logs**: Error messages, stack traces

### Feature Requests

For feature requests, please include:

- **Description**: What feature you'd like to see
- **Use case**: Why this feature would be useful
- **Proposed solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

## Development Workflow

### Daily Development

1. Pull latest changes: `git pull origin main`
2. Create feature branch: `git checkout -b feature/name`
3. Make changes with tests
4. Run tests: `npm test`
5. Commit with conventional format
6. Push and create PR

### Code Review Process

1. Automated checks run (lint, test, build)
2. Peer review by maintainers
3. Address feedback and iterate
4. Merge when approved

## Getting Help

- **Documentation**: Check the [README](README.md) first
- **Issues**: Search existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (link TBD)

## Recognition

Contributors are recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- Release notes

Thank you for contributing to Beam! 🚀