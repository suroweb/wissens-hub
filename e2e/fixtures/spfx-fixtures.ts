import { test as base, Page, BrowserContext } from '@playwright/test';
import path from 'path';

const tenant = process.env.WISSENSHUB_TENANT || 'contoso';
const WORKBENCH_URL = `https://${tenant}.sharepoint.com/_layouts/15/workbench.aspx?debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fbuild%2Fmanifests.js&debug=true&noredir=true`;
const AUTH_STATE_PATH = path.resolve(__dirname, '..', '.auth-state.json');

/**
 * Navigate to workbench, click "Load debug scripts" (EN/DE),
 * then add the specified web part to the canvas.
 *
 * Called ONCE per worker (not per test).
 */
export async function loadWorkbench(page: Page, webPartName: string): Promise<void> {
  await page.goto(WORKBENCH_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });

  // Click "Load debug scripts" / "Debugskripts laden"
  const loadDebugBtn = page.getByRole('button', { name: /load debug scripts|debugskripts laden/i });
  await loadDebugBtn.waitFor({ state: 'visible', timeout: 15_000 });
  await loadDebugBtn.click();

  // Wait for workbench canvas to appear
  await page.waitForTimeout(2_000);

  // Click the "+" to add a web part (EN/DE)
  const addWebPartBtn = page.locator('button[aria-label*="Webpart"][aria-label*="hinzuf\u00fcgen"], button[aria-label*="web part"][aria-label*="add" i]').first();
  await addWebPartBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await addWebPartBtn.click();

  // Wait for toolbox panel to open, then click the specified web part
  await page.waitForTimeout(1_000);
  const webPartEntry = page.locator(`button:has-text("${webPartName}")`).first();
  await webPartEntry.waitFor({ state: 'visible', timeout: 10_000 });
  await webPartEntry.click();

  // Wait for web part to render on the canvas
  await page.waitForTimeout(2_000);

  // Switch to preview mode (EN: "Preview", DE: "Vorschau")
  const previewBtn = page.getByRole('menuitem', { name: /preview|vorschau/i });
  await previewBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await previewBtn.click();

  // Wait for preview mode to settle
  await page.waitForTimeout(2_000);
}

/**
 * Reset the workbench to its default state between tests.
 * Closes any open panels/dialogs by pressing Escape.
 * Call this in beforeEach if your tests modify UI state.
 */
export async function resetWorkbenchState(page: Page): Promise<void> {
  // Close any open Fluent UI Panel by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // Press again in case a Dialog was on top of a Panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Creates a custom test fixture for a specific web part.
 * Returns a Playwright test object with worker-scoped shared browser context
 * and a workbenchPage fixture that loads the specified web part once per worker.
 */
export function createWebPartFixture(webPartName: string) {
  return base.extend<
    { workbenchPage: Page },
    { sharedContext: BrowserContext; sharedPage: Page }
  >({
    // Worker-scoped: one context + page for ALL tests in this worker
    sharedContext: [async ({ browser }, use) => {
      const context = await browser.newContext({
        storageState: AUTH_STATE_PATH,
        ignoreHTTPSErrors: true,
      });
      await use(context);
      await context.close();
    }, { scope: 'worker' }],

    sharedPage: [async ({ sharedContext }, use) => {
      const page = await sharedContext.newPage();
      await loadWorkbench(page, webPartName);
      await use(page);
      // Browser closes only after ALL tests complete
    }, { scope: 'worker' }],

    // Test-scoped alias so tests use `workbenchPage` instead of `page`
    workbenchPage: async ({ sharedPage }, use) => {
      await use(sharedPage);
    },
  });
}

export { expect } from '@playwright/test';
export { WORKBENCH_URL };
