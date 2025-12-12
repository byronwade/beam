import { execSync, spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { NetworkManager } from './network-manager';
import { HostsManager } from './hosts-manager';

export interface DNSConfig {
  mode: 'hosts' | 'system' | 'manual';
  primary?: string;
  secondary?: string;
}

export class BeamDNSManager {
  private configPath: string;
  private configDir: string;
  private hostsManager: HostsManager;

  constructor() {
    this.configDir = path.join(os.homedir(), '.beam');
    this.configPath = path.join(this.configDir, 'dns-config.json');
    this.hostsManager = new HostsManager();

    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  async isBeamConfigured(): Promise<boolean> {
    // Check if we have write access to hosts file (proxy for "configured")
    // Or check if we previously saved a successful config
    return await this.hostsManager.checkPermissions();
  }

  getPlatformName(): string {
    const platform = os.platform();
    switch (platform) {
      case 'darwin': return 'macOS';
      case 'win32': return 'Windows';
      case 'linux': return 'Linux';
      default: return platform;
    }
  }

  needsPrivileges(platform: string): boolean {
    // We try to avoid privileges, but if we need them for hosts file:
    // Windows usually needs Admin for hosts. Mac/Linux usually needs sudo.
    // But we'll return false here to try the "non-invasive" path first, 
    // and let configureForDomain fail/warn if needed.
    // Actually, returning true here triggers "Run with sudo" prompt in index.ts which is helpful.
    // Let's check strict permissions.
    try {
      fs.accessSync(this.hostsManager['hostsPath'], fs.constants.W_OK);
      return false;
    } catch {
      return true;
    }
  }

  async testInternetConnectivity(): Promise<boolean> {
    const status = await NetworkManager.getInstance().analyze();
    return status.hasInternet;
  }

  async configureBeamDNS(): Promise<boolean> {
    // This is called by "Global Setup".
    // Since we moved to per-domain (Hosts), there isn't really a "Global" state 
    // other than having permissions.
    // We basically just verify we can modify the system.
    const hasAccess = await this.hostsManager.checkPermissions();
    if (hasAccess) {
      return true;
    }
    return false;
  }

  showManualInstructions(): void {
    console.log('🔧 Manual Setup');
    console.log('================');
    console.log('Add your domains to your hosts file:');
    if (os.platform() === 'win32') {
      console.log('C:\\Windows\\System32\\drivers\\etc\\hosts');
    } else {
      console.log('/etc/hosts');
    }
    console.log('Entry: 127.0.0.1 <your-domain>.beam # beam-tunnel');
  }

  async configureForDomain(domain: string): Promise<boolean> {
    console.log(`   • Configuring DNS for ${domain}...`);

    // 1. Try Hosts File (Least Intrusive, Most Robust for single domain)
    const hasWriteAccess = await this.hostsManager.checkPermissions();
    if (hasWriteAccess) {
      const success = await this.hostsManager.addDomain(domain);
      if (success) {
        console.log(`   ✅ Added ${domain} to hosts file.`);
        return true;
      }
    } else {
      // Try to sudo if interactive? Or just warn.
      console.log('   ⚠️  No write access to hosts file (try running with sudo).');
    }

    // 2. Fallback: Check if we can use a local proxy or system DNS
    // For now, we mainly rely on hosts file for specific domains as it's the safest "universal" method

    // 3. Manual Instructions
    if (!hasWriteAccess) {
      console.log('   ❌ Automatic setup failed due to permissions.');
      console.log(`   💡 Please add this line to your hosts file manually:`);
      console.log(`      127.0.0.1 ${domain} # beam-tunnel`);
    }

    return false;
  }

  async cleanup(domain?: string): Promise<void> {
    if (domain) {
      await this.hostsManager.removeDomain(domain);
    }
    // Also cleanup system DNS if we ever messed with it (legacy support)
    // await this.restoreSystemDNS(); 
  }

  // ... (Keep legacy system DNS methods for "Global Mode" later if needed)
}
