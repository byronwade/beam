var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/frameworks/beam-config.ts
import { readFileSync, existsSync } from "fs";
import { join } from "path";
function loadBeamConfig(options) {
  const projectPath = process.cwd();
  let config = {
    enabled: true,
    inspect: false,
    copyToClipboard: false,
    qr: false,
    webhook: false
  };
  const configFile = findConfigFile(projectPath);
  if (configFile) {
    try {
      const fileConfig = loadConfigFile(configFile);
      config = { ...config, ...fileConfig };
    } catch (error) {
      console.warn("Beam: Failed to load config file:", error);
    }
  }
  const packageJsonPath = join(projectPath, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.beam && typeof packageJson.beam === "object") {
        config = { ...config, ...packageJson.beam };
      }
    } catch {
    }
  }
  config = {
    ...config,
    ...loadEnvConfig()
  };
  if (options) {
    config = { ...config, ...options };
  }
  return config;
}
function findConfigFile(projectPath) {
  const configFiles = [
    "beam.config.js",
    "beam.config.mjs",
    "beam.config.cjs",
    "beam.config.ts"
  ];
  for (const file of configFiles) {
    const filePath = join(projectPath, file);
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}
function loadConfigFile(filePath) {
  if (filePath.endsWith(".mjs") || filePath.endsWith(".js")) {
    try {
      const config = __require(filePath);
      return config.default || config;
    } catch {
      return {};
    }
  }
  return {};
}
function loadEnvConfig() {
  const config = {};
  if (process.env.BEAM_DISABLED === "true") {
    config.enabled = false;
  }
  if (process.env.BEAM_PORT) {
    config.port = parseInt(process.env.BEAM_PORT, 10);
  }
  if (process.env.BEAM_SUBDOMAIN) {
    config.subdomain = process.env.BEAM_SUBDOMAIN;
  }
  if (process.env.BEAM_INSPECT === "true") {
    config.inspect = true;
  }
  if (process.env.BEAM_AUTH) {
    config.auth = process.env.BEAM_AUTH;
  }
  if (process.env.BEAM_COPY === "true") {
    config.copyToClipboard = true;
  }
  if (process.env.BEAM_QR === "true") {
    config.qr = true;
  }
  if (process.env.BEAM_WEBHOOK === "true") {
    config.webhook = true;
  }
  if (process.env.BEAM_NAME) {
    config.name = process.env.BEAM_NAME;
  }
  return config;
}
export {
  loadBeamConfig
};
//# sourceMappingURL=beam-config.js.map