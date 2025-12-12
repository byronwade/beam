#!/usr/bin/env node

/**
 * Test Script for Beam .beam Domain Functionality
 *
 * This script demonstrates how .beam domains would work
 * if integrated with OpenNIC DNS servers.
 */

const readline = require('readline');
const os = require('os');

// Mock DNS Manager for demonstration
class MockDNSManager {
  async isBeamConfigured() {
    // Simulate checking if .beam domains work
    return false; // For demo, always say not configured
  }

  getPlatformName() {
    const platform = os.platform();
    switch (platform) {
      case 'darwin': return 'macOS';
      case 'win32': return 'Windows';
      case 'linux': return 'Linux';
      default: return platform;
    }
  }

  needsPrivileges(platform) {
    return platform === 'linux' || platform === 'win32';
  }
}

async function testBeamDomains() {
  console.log('🧪 Testing Beam .beam Domain Functionality');
  console.log('=========================================\n');

  const dnsManager = new MockDNSManager();

  // Test 1: Check current DNS configuration
  console.log('📡 Checking current DNS configuration...');
  const isConfigured = await dnsManager.isBeamConfigured();

  if (isConfigured) {
    console.log('✅ .beam domains are already configured!\n');
    console.log('🎉 You can now use .beam domains globally!');
    console.log('   Example: beam-abc123.beam\n');
    return;
  } else {
    console.log('❌ .beam domains are not configured yet.\n');
  }

  // Test 2: Show the opt-in prompt
  console.log('🌐 Beam Custom TLD Setup');
  console.log('─────────────────────────────');
  console.log('');
  console.log('Beam uses .beam domains for global access (like .com domains).');
  console.log('To enable .beam domains, we need to configure your DNS settings.');
  console.log('');
  console.log('This will:');
  console.log('• Add OpenNIC DNS servers for .beam resolution');
  console.log('• Keep your current DNS as backup');
  console.log('• Enable beam-abc123.beam domains worldwide');
  console.log('');
  console.log('Your current DNS will be backed up and can be restored anytime.');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enable .beam domains globally? (y/N): ', async (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n🔧 Configuring DNS for .beam domains...');

      const platform = dnsManager.getPlatformName();
      const needsPrivileges = dnsManager.needsPrivileges(require('os').platform());

      console.log(`   • Platform: ${platform}`);
      console.log(`   • Needs elevated privileges: ${needsPrivileges ? 'Yes' : 'No'}`);

      if (needsPrivileges) {
        console.log(`   ⚠️  This requires ${platform === 'Windows' ? 'administrator' : 'sudo'} privileges.`);
        console.log(`      Please run with elevated privileges to actually configure DNS.`);
        console.log('');
        console.log('   📋 Manual DNS Configuration:');
        console.log('      Primary DNS: 161.97.219.82 (OpenNIC)');
        console.log('      Secondary DNS: [your current DNS]');
        console.log('');
        console.log('   🧪 Test after manual configuration:');
        console.log('      nslookup test.beam');
        return;
      }

      console.log('   • Backing up current DNS settings...');
      console.log('   • Setting OpenNIC DNS: 161.97.219.82');
      console.log('   • Testing .beam domain resolution...');

      // In a real implementation, this would actually configure DNS
      const success = false; // Simulate failure for demo

      if (success) {
        console.log('✅ .beam domains enabled globally!');
        console.log('   Your DNS now supports beam-* domains from anywhere.');
        console.log('');
        console.log('🎉 Setup complete!');
        console.log('');
        console.log('🌐 Test your .beam domain:');
        console.log('   nslookup beam-test123.beam');
        console.log('');
        console.log('🌍 Use in browser:');
        console.log('   http://beam-test123.beam');
      } else {
        console.log('❌ DNS configuration failed.');
        console.log('   You can still use local access or configure DNS manually.');
        console.log('');
        console.log('📋 Manual setup instructions:');
        console.log('   1. Go to System Settings > Network > DNS');
        console.log('   2. Add DNS server: 161.97.219.82');
        console.log('   3. Test: nslookup test.beam');
      }
    } else {
      console.log('\nℹ️  .beam domains not enabled.');
      console.log('   You can still use:');
      console.log('   • Local access: http://127.0.0.1:4005');
      console.log('   • Tor access: [your].onion (in Tor Browser)');
      console.log('   • Webhook bridge: beam 3000 --webhook-bridge');
      console.log('');
      console.log('💡 Enable .beam domains later with: beam dns-setup');
    }

    console.log('\n✨ Test complete!');
  });
}

// Handle the script being run directly
if (require.main === module) {
  testBeamDomains().catch(console.error);
}

module.exports = { testBeamDomains };
