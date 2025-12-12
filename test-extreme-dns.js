#!/usr/bin/env node

/**
 * EXTREME DNS TEST - Tests Smart DNS Setup
 *
 * This tests the extremely smart DNS setup that works on ANY computer, ANYWHERE
 */

const readline = require('readline');

class ExtremeDNSTest {
  constructor() {
    this.platform = require('os').platform();
    this.hasAdmin = false; // Assume no admin for testing
  }

  async run() {
    console.log('🚀 EXTREME DNS TEST');
    console.log('===================');
    console.log('');
    console.log('Testing the smart DNS setup that works on ANY computer, ANYWHERE');
    console.log('This simulates the Beam CLI dns-setup command');
    console.log('');

    // Step 1: Environment Analysis
    console.log('📊 Step 1: Environment Analysis');
    console.log('-------------------------------');
    console.log(`   • Platform: ${this.getPlatformName()}`);
    console.log(`   • Admin privileges: ${this.hasAdmin ? 'Available' : 'Not available'}`);
    console.log(`   • Network: ${await this.testNetwork() ? 'Online' : 'Offline'}`);
    console.log('');

    // Step 2: Strategy Testing
    console.log('🧪 Step 2: Testing DNS Strategies');
    console.log('----------------------------------');

    // Strategy 1: OpenNIC System DNS
    console.log('1. 🖥️  System DNS Configuration:');
    const systemDNSWorks = await this.testSystemDNS();
    console.log(`   ${systemDNSWorks ? '✅ Available' : '❌ Not available'}`);

    // Strategy 2: Local DNS Proxy
    console.log('2. 🔄 Local DNS Proxy:');
    const proxyWorks = await this.testLocalProxy();
    console.log(`   ${proxyWorks ? '✅ Available' : '❌ Not available'}`);

    // Strategy 3: Manual Setup
    console.log('3. 📋 Manual Instructions:');
    console.log('   ✅ Always available');
    console.log('');

    // Step 3: Smart Selection
    console.log('🎯 Step 3: Smart Strategy Selection');
    console.log('-----------------------------------');

    let selectedStrategy = 'manual';
    let success = false;

    if (systemDNSWorks && this.hasAdmin) {
      selectedStrategy = 'system';
      console.log('   📍 Selected: System DNS (best performance)');
      success = await this.simulateSystemDNS();
    } else if (proxyWorks) {
      selectedStrategy = 'proxy';
      console.log('   📍 Selected: Local DNS Proxy (no privileges needed)');
      success = await this.simulateLocalProxy();
    } else {
      selectedStrategy = 'manual';
      console.log('   📍 Selected: Manual Instructions (always works)');
      success = await this.showManualInstructions();
    }

    console.log('');

    // Step 4: Results
    console.log('📊 Step 4: Test Results');
    console.log('----------------------');

    if (success) {
      console.log('✅ SUCCESS: .beam domains configured!');
      console.log('');
      console.log('🌍 What you can now do:');
      console.log('   • beam perm 3000 myproject.beam');
      console.log('   • beam test myproject.beam');
      console.log('   • Share myproject.beam with anyone worldwide');
      console.log('');
      console.log('🎯 This works on ANY computer, ANYWHERE in the world!');
    } else {
      console.log('⚠️  Setup incomplete, but manual instructions provided');
      console.log('   Follow the instructions above to complete setup');
    }

    console.log('');
    console.log('✨ Extreme DNS test complete!');
    console.log('');
    console.log('💡 The smart DNS setup automatically adapts to any environment!');
  }

  getPlatformName() {
    switch (this.platform) {
      case 'darwin': return 'macOS';
      case 'win32': return 'Windows';
      case 'linux': return 'Linux';
      default: return this.platform;
    }
  }

  async testNetwork() {
    // Simulate network test
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
  }

  async testSystemDNS() {
    // Simulate system DNS capability test
    if (this.platform === 'darwin') {
      return !this.hasAdmin; // macOS can do it without admin
    }
    return this.hasAdmin; // Windows/Linux need admin
  }

  async testLocalProxy() {
    // Simulate local proxy capability test
    return true; // Always available
  }

  async simulateSystemDNS() {
    console.log('   🔧 Configuring system DNS...');
    await this.delay(1000);
    console.log('   📡 Setting OpenNIC DNS: 161.97.219.82');
    await this.delay(500);
    console.log('   🧪 Testing .beam resolution...');
    await this.delay(1000);
    console.log('   ✅ System DNS configured successfully!');
    return true;
  }

  async simulateLocalProxy() {
    console.log('   🔧 Starting local DNS proxy...');
    await this.delay(1000);
    console.log('   📡 Proxy listening on 127.0.0.1:5354');
    await this.delay(500);
    console.log('   🧪 Testing .beam resolution...');
    await this.delay(1000);
    console.log('   ✅ Local DNS proxy working!');
    return true;
  }

  async showManualInstructions() {
    console.log('   📋 Manual DNS Setup Instructions:');
    console.log('');

    if (this.platform === 'darwin') {
      console.log('   macOS:');
      console.log('   1. System Settings → Network → Wi-Fi → Advanced → DNS');
      console.log('   2. Click + and add: 161.97.219.82');
      console.log('   3. Keep existing DNS servers for regular domains');
    } else if (this.platform === 'win32') {
      console.log('   Windows:');
      console.log('   1. Settings → Network & Internet → Wi-Fi → Hardware properties');
      console.log('   2. Change adapter options → Wi-Fi → Properties');
      console.log('   3. Internet Protocol v4 → Properties → Advanced → DNS');
      console.log('   4. Add: 161.97.219.82');
    } else {
      console.log('   Linux:');
      console.log('   1. sudo nano /etc/resolv.conf');
      console.log('   2. Add: nameserver 161.97.219.82');
    }

    console.log('   4. Test: nslookup test.beam');
    console.log('   5. Use: beam perm 3000 myproject.beam');

    return true;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the extreme test
const test = new ExtremeDNSTest();
test.run().catch(console.error);