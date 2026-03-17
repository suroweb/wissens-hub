import { chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

const AUTH_STATE_PATH = path.resolve(__dirname, '.auth-state.json');

const tenant = process.env.WISSENSHUB_TENANT || 'contoso';
const WORKBENCH_URL = `https://${tenant}.sharepoint.com/_layouts/15/workbench.aspx?debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fbuild%2Fmanifests.js&debug=true&noredir=true`;

async function globalSetup(config: FullConfig): Promise<void> {
  // If auth state exists, try to reuse it (SharePoint sessions can last several hours)
  // Extend window to 8 hours -- SharePoint refresh tokens are valid much longer than 1 hour
  if (fs.existsSync(AUTH_STATE_PATH)) {
    const stats = fs.statSync(AUTH_STATE_PATH);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < 8 * 60 * 60 * 1000) {
      console.log('[auth] Reusing existing auth state (age: ' + Math.round(ageMs / 60000) + 'm)');
      return;
    }
  }

  console.log('[auth] Auth state expired or missing. Using Edge persistent profile for SSO...');

  // Use Edge's real user data directory to pick up existing SSO cookies.
  // This avoids interactive login when the user is already signed into Edge.
  const edgeUserDataDir = path.join(
    os.homedir(),
    'Library/Application Support/Microsoft Edge'
  );

  // Use launchPersistentContext with Edge's user profile (read-only access via a copy)
  // Fall back to interactive login if persistent context fails.
  try {
    const context = await chromium.launchPersistentContext(
      edgeUserDataDir,
      {
        channel: 'msedge',
        headless: false,
        ignoreHTTPSErrors: true,
        args: [
          '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults',
          '--allow-insecure-localhost',
          '--no-first-run',
          '--no-default-browser-check',
        ],
      }
    );

    const page = context.pages()[0] || await context.newPage();
    await page.goto(WORKBENCH_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Wait for workbench to load (SSO should handle auth automatically)
    await page.waitForURL('**/workbench.aspx*', { timeout: 60_000 });
    console.log('[auth] SSO login successful via Edge profile. Saving auth state...');

    await context.storageState({ path: AUTH_STATE_PATH });
    await context.close();
  } catch (err) {
    console.log('[auth] Persistent context failed, falling back to interactive login...');
    console.log('[auth] Please sign in to SharePoint in the browser window that opens.');

    const browser = await chromium.launch({
      channel: 'msedge',
      headless: false,
      args: [
        '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults',
        '--allow-insecure-localhost',
      ],
    });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    await page.goto(WORKBENCH_URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForURL('**/workbench.aspx*', { timeout: 120_000 });
    console.log('[auth] Interactive login successful. Saving auth state...');

    await context.storageState({ path: AUTH_STATE_PATH });
    await browser.close();
  }
}

export default globalSetup;
