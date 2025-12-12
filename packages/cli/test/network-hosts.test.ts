import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NetworkManager } from '../src/network-manager';
import { HostsManager } from '../src/hosts-manager';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Mock Modules
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    return {
        default: {
            ...actual,
            promises: {
                ...actual.promises,
                access: vi.fn(),
                readFile: vi.fn(),
                appendFile: vi.fn(),
                writeFile: vi.fn(),
            },
            constants: actual.constants,
        }
    };
});

describe('NetworkManager', () => {
    it('should detect internet connectivity', async () => {
        // Mock https.request
        const req: any = {
            on: vi.fn(),
            end: vi.fn(),
            destroy: vi.fn(),
        };

        vi.spyOn(https, 'request').mockImplementation((url, options, callback) => {
            if (callback) callback({ statusCode: 200 } as any);
            return req;
        });

        const status = await NetworkManager.getInstance().analyze();
        expect(status.hasInternet).toBe(true);
    });
});

describe('HostsManager', () => {
    let hostsManager: HostsManager;

    beforeEach(() => {
        vi.clearAllMocks();
        hostsManager = new HostsManager();
    });

    it('should check permissions correctly', async () => {
        (fs.promises.access as any).mockResolvedValue(undefined); // Success
        expect(await hostsManager.checkPermissions()).toBe(true);

        (fs.promises.access as any).mockRejectedValue(new Error('EACCES'));
        expect(await hostsManager.checkPermissions()).toBe(false);
    });

    it('should add domain to hosts', async () => {
        (fs.promises.readFile as any).mockResolvedValue('127.0.0.1 localhost\n');
        (fs.promises.appendFile as any).mockResolvedValue(undefined);
        (fs.promises.access as any).mockResolvedValue(undefined);

        const result = await hostsManager.addDomain('test.beam');
        expect(result).toBe(true);
        expect(fs.promises.appendFile).toHaveBeenCalledWith(
            expect.stringContaining('hosts'),
            expect.stringContaining('127.0.0.1 test.beam # beam-tunnel')
        );
    });

    it('should not add if already exists', async () => {
        (fs.promises.readFile as any).mockResolvedValue('127.0.0.1 localhost\n127.0.0.1 test.beam # beam-tunnel\n');

        const result = await hostsManager.addDomain('test.beam');
        expect(result).toBe(true);
        expect(fs.promises.appendFile).not.toHaveBeenCalled();
    });

    it('should remove domain', async () => {
        (fs.promises.readFile as any).mockResolvedValue('127.0.0.1 localhost\n127.0.0.1 remove.beam # beam-tunnel\n');
        (fs.promises.writeFile as any).mockResolvedValue(undefined);

        const result = await hostsManager.removeDomain('remove.beam');
        expect(result).toBe(true);
        expect(fs.promises.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('hosts'),
            expect.not.stringContaining('remove.beam')
        );
    });
});
