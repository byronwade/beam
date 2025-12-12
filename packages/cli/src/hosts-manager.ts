import fs from 'fs';
import os from 'os';
import path from 'path';

export class HostsManager {
    private hostsPath: string;

    constructor() {
        this.hostsPath = process.platform === 'win32'
            ? path.join('C:', 'Windows', 'System32', 'drivers', 'etc', 'hosts')
            : '/etc/hosts';
    }

    /**
     * Add a domain to the hosts file pointing to 127.0.0.1
     * Returns true if successful, false if permission denied/error
     */
    async addDomain(domain: string): Promise<boolean> {
        try {
            const content = await this.readHosts();
            if (this.hasDomain(content, domain)) {
                return true; // Already exists
            }

            const newEntry = `\n127.0.0.1 ${domain} # beam-tunnel\n`;
            await fs.promises.appendFile(this.hostsPath, newEntry);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Remove a domain from the hosts file
     */
    async removeDomain(domain: string): Promise<boolean> {
        try {
            let content = await this.readHosts();
            if (!this.hasDomain(content, domain)) {
                return true;
            }

            // Regex to remove the line: 127.0.0.1 domain # beam-tunnel
            const regex = new RegExp(`^.*${domain}.*# beam-tunnel.*$`, 'gm');
            content = content.replace(regex, '');

            // Clean up multiple newlines
            content = content.replace(/\n\s*\n/g, '\n');

            await fs.promises.writeFile(this.hostsPath, content.trim() + '\n');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
      * Check if we have write access to hosts file
      */
    async checkPermissions(): Promise<boolean> {
        try {
            await fs.promises.access(this.hostsPath, fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }

    private async readHosts(): Promise<string> {
        return fs.promises.readFile(this.hostsPath, 'utf8');
    }

    private hasDomain(content: string, domain: string): boolean {
        return content.includes(domain) && content.includes('# beam-tunnel');
    }
}
