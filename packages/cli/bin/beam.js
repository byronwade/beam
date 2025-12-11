#!/usr/bin/env node

import("../dist/index.js").catch(async () => {
  console.error("Beam CLI is not built yet. Run `npm run build`.");
  process.exit(1);
});





