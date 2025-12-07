#!/usr/bin/env node
/**
 * Auto-configure PATH for global installs
 * Detects package manager (npm, yarn, pnpm, bun) and adds their global bin to PATH
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

function getShellConfig() {
  const shell = process.env.SHELL || "";
  if (shell.includes("zsh")) {
    return join(homedir(), ".zshrc");
  } else if (shell.includes("bash")) {
    return join(homedir(), ".bashrc");
  }
  // Default to .zshrc on macOS
  return join(homedir(), ".zshrc");
}

function getGlobalBinPaths() {
  const paths = [];
  const home = homedir();

  // Bun
  const bunPath = join(home, ".bun/bin");
  if (existsSync(bunPath)) {
    paths.push({ name: "bun", path: bunPath });
  }

  // npm
  try {
    const npmPrefix = execSync("npm config get prefix", { encoding: "utf-8", stdio: "pipe" }).trim();
    if (npmPrefix && !npmPrefix.includes("undefined")) {
      const npmBin = join(npmPrefix, "bin");
      if (existsSync(npmBin)) {
        paths.push({ name: "npm", path: npmBin });
      }
    }
  } catch {
    // npm not available or error
  }

  // Yarn
  try {
    const yarnBin = execSync("yarn global bin", { encoding: "utf-8", stdio: "pipe" }).trim();
    if (yarnBin && existsSync(yarnBin)) {
      paths.push({ name: "yarn", path: yarnBin });
    }
  } catch {
    // yarn not available or error
  }

  // pnpm
  try {
    const pnpmBin = execSync("pnpm config get global-bin-dir", { encoding: "utf-8", stdio: "pipe" }).trim();
    if (pnpmBin && existsSync(pnpmBin)) {
      paths.push({ name: "pnpm", path: pnpmBin });
    }
  } catch {
    // pnpm not available or error
  }

  return paths;
}

function isPathConfigured(configPath, binPath) {
  if (!existsSync(configPath)) {
    return false;
  }
  const content = readFileSync(configPath, "utf-8");
  return content.includes(binPath) || content.includes("~/.bun/bin") || 
         content.includes("~/.npm-global/bin") || content.includes("~/.yarn/bin");
}

function addPathToConfig(configPath, binPaths) {
  if (binPaths.length === 0) {
    return false;
  }

  if (existsSync(configPath)) {
    const content = readFileSync(configPath, "utf-8");
    
    // Check which paths need to be added
    const pathsToAdd = binPaths.filter(p => !content.includes(p.path));
    
    if (pathsToAdd.length === 0) {
      return false; // All paths already configured
    }

    // Add individual export lines for each missing path
    const lines = pathsToAdd.map(p => 
      `# Added by bmup for ${p.name} global binaries\nexport PATH="${p.path}:$PATH"`
    ).join("\n");
    
    writeFileSync(configPath, content + "\n" + lines + "\n", "utf-8");
    return true;
  } else {
    // Create new config file with all paths
    const lines = binPaths.map(p => 
      `# Added by bmup for ${p.name} global binaries\nexport PATH="${p.path}:$PATH"`
    ).join("\n");
    writeFileSync(configPath, lines + "\n", "utf-8");
    return true;
  }
}

function main() {
  // Only skip in actual CI environments
  if (process.env.GITHUB_ACTIONS || process.env.GITLAB_CI || process.env.CIRCLECI) {
    return;
  }

  // Get all global bin paths from installed package managers
  const binPaths = getGlobalBinPaths();
  
  if (binPaths.length === 0) {
    return; // No package managers detected
  }

  // Check if PATH already includes any of these paths
  const currentPath = process.env.PATH || "";
  const allPathsInEnv = binPaths.every(p => 
    currentPath.includes(p.path) || currentPath.includes("~/.bun/bin")
  );
  
  if (allPathsInEnv) {
    return; // Already in PATH
  }

  try {
    const configPath = getShellConfig();
    
    // Check if already configured
    const alreadyConfigured = binPaths.some(p => isPathConfigured(configPath, p.path));
    if (alreadyConfigured) {
      console.log("\n✓ Global bin paths already configured in", configPath);
      console.log("  Run: source", configPath, "or restart your terminal to use bmup");
      return;
    }

    const added = addPathToConfig(configPath, binPaths);
    if (added) {
      const pmNames = binPaths.map(p => p.name).join(", ");
      console.log("\n⚡ bmup: Added global bin paths to PATH in", configPath);
      console.log("  Detected package managers:", pmNames);
      console.log("  Run: source", configPath);
      console.log("  Or restart your terminal, then use: bmup 3000");
    }
  } catch (error) {
    // Show error but don't break install
    console.log("\n⚠ bmup: Could not auto-configure PATH:", error.message);
    console.log("  Manually add global bin directories to your ~/.zshrc");
  }
}

main();
