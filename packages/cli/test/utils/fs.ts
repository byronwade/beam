import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function createTempConfig(content: string, filename = ".beam.yaml") {
  const dir = mkdtempSync(join(tmpdir(), "beam-test-"));
  const filepath = join(dir, filename);
  writeFileSync(filepath, content);

  const cleanup = () => {
    rmSync(dir, { recursive: true, force: true });
  };

  return { dir, filepath, cleanup };
}

export function createTempJsonConfig(data: Record<string, unknown>, filename = "beam.config.json") {
  const content = JSON.stringify(data, null, 2);
  return createTempConfig(content, filename);
}

