// @ts-ignore
import NatAPI from 'nat-api';
import util from 'util';

export class InternetManager {
    private client: NatAPI;
    private mappedPorts: Set<number> = new Set();

    constructor() {
        this.client = new NatAPI();
    }

    /**
     * Map a public port to a local private port using UPnP/PMP
     */
    async mapPort(publicPort: number, privatePort: number): Promise<boolean> {
        return new Promise((resolve) => {
            this.client.map(publicPort, privatePort, (err) => {
                if (err) {
                    console.error(`   ❌ Failed to map port ${publicPort}:`, err.message);
                    resolve(false);
                } else {
                    console.log(`   ✅ Port mapped: Public :${publicPort} → Local :${privatePort}`);
                    this.mappedPorts.add(publicPort);
                    resolve(true);
                }
            });
        });
    }

    /**
     * Unmap a specific port
     */
    async unmapPort(publicPort: number): Promise<void> {
        return new Promise((resolve) => {
            this.client.unmap(publicPort, (err) => {
                if (err) {
                    // ignore errors on cleanup
                } else {
                    console.log(`   🧹 Port unmapped: :${publicPort}`);
                }
                this.mappedPorts.delete(publicPort);
                resolve();
            });
        });
    }

    /**
     * Get the public IP address
     */
    async getPublicIP(): Promise<string | null> {
        return new Promise((resolve) => {
            this.client.externalIp((err, ip) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(ip);
                }
            });
        });
    }

    /**
     * Cleanup all mapped ports
     */
    async cleanup(): Promise<void> {
        if (this.mappedPorts.size === 0) return;

        console.log('   🧹 Cleaning up internet mappings...');
        const promises = Array.from(this.mappedPorts).map(port => this.unmapPort(port));
        await Promise.all(promises);
    }
}
