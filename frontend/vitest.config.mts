import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // tsconfig says `jsx: "preserve"` (Next compiles JSX itself); tests need it compiled.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: { "@": root },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    restoreMocks: true,
  },
});
