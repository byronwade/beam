import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InternetManager } from '../src/internet-manager';

// Mock nat-api
const mockMap = vi.fn();
const mockUnmap = vi.fn();
const mockExternalIp = vi.fn();

vi.mock('nat-api', () => {
    return {
        default: class MockNatAPI {
            map = mockMap;
            unmap = mockUnmap;
            externalIp = mockExternalIp;
        }
    };
});

describe('InternetManager', () => {
    let internetManager: InternetManager;

    beforeEach(() => {
        vi.clearAllMocks();
        internetManager = new InternetManager();
    });

    it('should map a port successfully', async () => {
        mockMap.mockImplementation((publicPort, privatePort, cb) => cb(null)); // Success

        const result = await internetManager.mapPort(8080, 3000);
        expect(result).toBe(true);
        expect(mockMap).toHaveBeenCalledWith(8080, 3000, expect.any(Function));
    });

    it('should handle map failure', async () => {
        mockMap.mockImplementation((publicPort, privatePort, cb) => cb(new Error('UPnP Error')));

        const result = await internetManager.mapPort(8080, 3000);
        expect(result).toBe(false);
    });

    it('should unmap a port', async () => {
        mockUnmap.mockImplementation((publicPort, cb) => cb(null));

        await internetManager.unmapPort(8080);
        expect(mockUnmap).toHaveBeenCalledWith(8080, expect.any(Function));
    });

    it('should get public IP', async () => {
        mockExternalIp.mockImplementation((cb) => cb(null, '1.2.3.4'));

        const ip = await internetManager.getPublicIP();
        expect(ip).toBe('1.2.3.4');
    });

    it('should cleanup mapped ports', async () => {
        mockMap.mockImplementation((publicPort, privatePort, cb) => cb(null));
        mockUnmap.mockImplementation((publicPort, cb) => cb(null));

        // Map two ports
        await internetManager.mapPort(8080, 3000);
        await internetManager.mapPort(9090, 4000);

        // Cleanup
        await internetManager.cleanup();

        expect(mockUnmap).toHaveBeenCalledTimes(2);
        expect(mockUnmap).toHaveBeenCalledWith(8080, expect.any(Function));
        expect(mockUnmap).toHaveBeenCalledWith(9090, expect.any(Function));
    });
});
