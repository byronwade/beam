#!/usr/bin/env node

// Import the main CLI module
import("./../dist/index.js").catch((err) => {
  console.error("Beam CLI is not built yet. Run `npm run build`.");
  console.error("Error:", err.message);
  process.exit(1);
});






