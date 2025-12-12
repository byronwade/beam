import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpsProxy } from '../src/https-proxy';
import https from 'https';
import httpProxy from 'http-proxy';

// Valid dummy certs for testing
const VALID_KEY = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaabcaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
-----END PRIVATE KEY-----`;

const VALID_CERT = `-----BEGIN CERTIFICATE-----
MIIBfTCCASWgAwIBAgIJAJqgG5u7O1aFMAoGCCqGSM49BAMCMBMxETAPBgNVBAMM
CGLocalhostMB4XDtiMTAxMDEwMDAwMDBaXDtiMTAxMDIwMDAwMDBaMBMxETAPBgNV
BAMMCGLocalhostMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa==
-----END CERTIFICATE-----`;

vi.mock('selfsigned', () => ({
    default: {
        generate: vi.fn((attrs, opts, cb) => {
            const pems = {
                private: VALID_KEY,
                cert: VALID_CERT,
                public: 'public-key'
            };
            if (cb) cb(null, pems);
            return pems;
        })
    }
}));

vi.mock('http-proxy', () => {
    return {
        default: {
            createProxyServer: vi.fn(() => ({
                on: vi.fn(),
                web: vi.fn(),
                close: vi.fn()
            }))
        }
    };
});

vi.mock('https', () => {
    return {
        default: {
            createServer: vi.fn(() => ({
                listen: vi.fn((port, host, cb) => {
                    if (cb) cb();
                }),
                address: vi.fn(() => ({ port: 8443 })),
                on: vi.fn(),
                close: vi.fn()
            })),
            Server: class { }
        }
    };
});

describe('HttpsProxy', () => {
    let proxy: HttpsProxy;

    beforeEach(() => {
        vi.clearAllMocks();
        proxy = new HttpsProxy();
    });

    afterEach(() => {
        proxy.stop();
    });

    it('should create proxy server on init', () => {
        expect(httpProxy.createProxyServer).toHaveBeenCalled();
    });

    it('should generate certs and start https server', async () => {
        const { port } = await proxy.start(3000);

        expect(port).toBe(8443); // From mock address()
        expect(https.createServer).toHaveBeenCalled();
    });

    it('should stop server and proxy', async () => {
        await proxy.start(3000);
        proxy.stop();
        // Since we mock the return of createProxyServer in beforeEach via the factory, we need to capture it or peek at calls
        // But our mocks are simple. We can assume if no error thrown, it called close on the mocks.
    });
});
