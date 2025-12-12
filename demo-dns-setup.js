#!/usr/bin/env node

/**
 * DEMO: OpenNIC .beam TLD Opt-in Experience
 *
 * This demonstrates what the DNS setup would look like
 * when integrated into the Beam CLI.
 */

const readline = require('readline');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demonstrateOptIn() {
  console.log('🚀 Starting Beam Tunnel...');
  console.log('   Port: 3000');
  console.log('   Domain: beam-1765504509752.onion');
  console.log('');

  // Simulate tunnel startup
  await sleep(1000);

  console.log('⚠️  .beam domains not configured yet');
  console.log('');

  // Show the opt-in prompt
  console.log(`
🌐 Beam Custom TLD Setup
─────────────────────────────

Beam uses .beam domains for global access (like .com domains).
To enable .beam domains, we need to configure your DNS settings.

This will:
• Add OpenNIC DNS servers for .beam resolution
• Keep your current DNS as backup
• Enable beam-abc123.beam domains worldwide

Your current DNS will be backed up and can be restored anytime.

`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enable .beam domains globally? (y/N): ', async (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('');
        console.log('🔧 Configuring DNS for .beam domains...');
        console.log('   • Detecting platform: macOS');
        console.log('   • Backing up current DNS settings...');
        console.log('   • Setting OpenNIC DNS: 161.97.219.82');
        console.log('   • Testing .beam domain resolution...');

        // Simulate the process
        await sleep(2000);

        console.log('✅ .beam domains enabled globally!');
        console.log('   Your DNS now supports beam-* domains from anywhere.');
        console.log('');
        console.log('🎉 Setup complete!');
        console.log('');
        console.log('🌐 Your tunnel is now accessible worldwide at:');
        console.log('   beam-1765504509752.beam');
        console.log('');
        console.log('💡 Share this URL with anyone - it works from any browser!');

        resolve(true);
      } else {
        console.log('');
        console.log('ℹ️  .beam domains not enabled.');
        console.log('   You can still use local access (127.0.0.1:4005)');
        console.log('   Or enable .beam domains later with: beam dns-setup');
        console.log('');
        console.log('🌐 Your tunnel is accessible locally at:');
        console.log('   http://127.0.0.1:4005');

        resolve(false);
      }
    });
  });
}

// Run the demonstration
demonstrateOptIn().then(() => {
  console.log('');
  console.log('✨ Demo complete! This is how the OpenNIC opt-in would work.');
  process.exit(0);
}).catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
