import { defineConfig } from "@playwright/test";

// Uses the installed Google Chrome so no browser download is needed. Serves the production build.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:4173", channel: "chrome" },
  webServer: { command: "npm run build && npx vite preview --host 127.0.0.1 --port 4173", url: "http://127.0.0.1:4173", reuseExistingServer: true, timeout: 120_000 },
});
