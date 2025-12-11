# Security Policy

## 🔒 Security Overview

Beam takes security seriously. As a tunneling service that handles network traffic, we are committed to ensuring the security and privacy of our users' data and communications.

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability in Beam, please help us by reporting it responsibly.

### 📧 How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:
- **security@beam.dev** (preferred)
- Or create a private security advisory on GitHub

### 📋 What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Impact**: What an attacker could achieve by exploiting this vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Proof of Concept**: Code or detailed instructions demonstrating the vulnerability
- **Affected Versions**: Which versions of Beam are affected
- **Environment**: Any specific environment details (OS, Node.js version, etc.)
- **Mitigation**: Any suggested fixes or workarounds

### ⏱️ Response Timeline

We will acknowledge your report within **48 hours** and provide a more detailed response within **7 days** indicating our next steps.

We will keep you informed about our progress throughout the process of fixing the vulnerability.

### 🎯 Vulnerability Classification

We classify vulnerabilities using the [CVSS (Common Vulnerability Scoring System)](https://www.first.org/cvss/):

- **Critical**: CVSS 9.0-10.0
- **High**: CVSS 7.0-8.9
- **Medium**: CVSS 4.0-6.9
- **Low**: CVSS 0.1-3.9
- **Info**: CVSS 0.0

### 🛡️ Our Commitment

- We will **not** pursue legal action against security researchers who follow this policy
- We will **credit** researchers who responsibly disclose vulnerabilities (unless you prefer to remain anonymous)
- We will **coordinate** public disclosure with you to ensure proper timing
- We will **prioritize** fixing security issues based on their severity and impact

## 🔍 Security Considerations

### Architecture Security

Beam's architecture includes several security measures:

- **End-to-end encryption**: All tunnel traffic is encrypted
- **Authentication**: CLI tokens and API keys for access control
- **Rate limiting**: Protection against abuse and DoS attacks
- **Request validation**: Input sanitization and validation
- **Audit logging**: Comprehensive logging for security monitoring

### Network Security

- **HTTPS-only**: All communications use TLS 1.2+
- **Certificate validation**: Proper SSL/TLS certificate validation
- **Firewall rules**: Restrictive network access policies
- **DDoS protection**: Built-in protection against denial-of-service attacks

### Data Protection

- **Encryption at rest**: Sensitive data is encrypted in the database
- **Secure key management**: Proper handling of encryption keys
- **Data minimization**: Only collect necessary user data
- **Privacy by design**: User privacy considerations in all features

## 🛠️ Security Best Practices for Users

### For Self-Hosting

1. **Use strong encryption keys**: Generate secure random keys for DATA_ENCRYPTION_KEY
2. **Configure HTTPS**: Always use HTTPS in production with valid certificates
3. **Restrict network access**: Use firewalls to limit access to your Beam instance
4. **Regular updates**: Keep all dependencies and the Beam codebase updated
5. **Monitor logs**: Enable and monitor security-relevant logs

### For CLI Usage

1. **Secure token storage**: Store CLI tokens securely (avoid hardcoding in scripts)
2. **Use HTTPS locally**: When possible, use HTTPS for local development
3. **Validate certificates**: Don't disable SSL certificate validation
4. **Limit tunnel scope**: Only expose necessary ports and services

## 🔄 Security Updates

### Patch Releases

We release security patches as needed. Critical security fixes are released immediately.

### Version Support

We provide security updates for:
- The latest major version
- The previous major version (for 6 months after new major release)

### Notification Channels

Security updates are announced via:
- GitHub Security Advisories
- Release notes on GitHub
- Our website and documentation
- Email notifications (for critical issues)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) - Cybersecurity best practices
- [SANS CWE Top 25](https://cwe.mitre.org/top25/) - Most dangerous software errors

## 🤝 Security Hall of Fame

We maintain a Security Hall of Fame to recognize researchers who have helped make Beam more secure. Contributors are listed with their permission.

### 2024 Contributors

*None yet - be the first!*

---

**Thank you for helping keep Beam and its users secure!** 🛡️

For questions about this security policy, please contact security@beam.dev.
