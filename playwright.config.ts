import { defineConfig } from "@playwright/test";

// Chromium engine (installed Google Chrome) and WebKit (pinned build from `npx playwright install webkit`; CI must run `npx playwright install --with-deps webkit` and `--project=chromium`/`webkit` separately if Chrome is absent). Serves the production build.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: { baseURL: "http://127.0.0.1:4173" },
  projects: [{ name: "chromium", use: { browserName: "chromium", channel: "chrome" } }, { name: "webkit", use: { browserName: "webkit" } }],
  webServer: { command: "npm run build && npx vite preview --host 127.0.0.1 --port 4173", url: "http://127.0.0.1:4173", reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
