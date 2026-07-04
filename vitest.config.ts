import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror the "@/*" path alias from tsconfig.json
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  oxc: {
    // Next.js requires "jsx": "preserve" in tsconfig.json, which Vitest's
    // transform can't consume for .tsx imports. Use the automatic JSX
    // runtime when transforming test dependencies instead.
    jsx: { runtime: "automatic" },
  },
});
