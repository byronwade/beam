#!/usr/bin/env node

const { spawn } = require('child_process');

// Get port from command line arguments
const args = process.argv.slice(2);
let port = '3000'; // default port

// Check for --port or -p flag
const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
if (portIndex !== -1 && args[portIndex + 1]) {
  port = args[portIndex + 1];
  // Remove the port arguments
  args.splice(portIndex, 2);
} else if (args.length > 0 && /^\d+$/.test(args[0])) {
  // If first argument is a number, treat it as port
  port = args[0];
  args.shift();
}

// Spawn next dev with the specified port
const child = spawn('next', ['dev', '-p', port, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, PORT: port }
});

child.on('exit', (code) => {
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});
