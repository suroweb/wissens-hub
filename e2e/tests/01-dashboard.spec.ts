import { expect, resetWorkbenchState, createWebPartFixture } from '../fixtures/spfx-fixtures';

/**
 * E2E Flow: Dashboard
 * Verifies article browsing, filtering, search, and view toggle
 * against the SharePoint workbench with mock data.
 *
 * Web part display name: "Dashboard" (from manifest preconfiguredEntries)
 * Mock data: 10 articles (6 Published, 2 Draft, 1 InReview, 1 Archived)
 */

const dashboardTest = createWebPartFixture('WissensHub Dashboard');

dashboardTest.describe.serial('Dashboard Flow', () => {
  dashboardTest.beforeEach(async ({ workbenchPage }) => {
    await resetWorkbenchState(workbenchPage);
  });

  dashboardTest('Web part renders on workbench', async ({ workbenchPage }) => {
    // The Dashboard web part should be loaded via the worker-scoped fixture
    const webpart = workbenchPage.locator('[class*="dashboard"]');
    await expect(webpart.first()).toBeVisible({ timeout: 15_000 });
  });

  dashboardTest('Article cards are displayed', async ({ workbenchPage }) => {
    // Wait for mock data to load (MockPageService returns 10 articles, 6 Published)
    // Look for a known article title from mock data
    await workbenchPage.waitForTimeout(3_000);

    // "Passwort-Richtlinie" is a Published article in MOCK_ARTICLES
    await expect(workbenchPage.getByText('Passwort-Richtlinie')).toBeVisible({ timeout: 10_000 });

    // Verify at least one card element is present
    const cards = workbenchPage.locator('[class*="cardGrid"] > div, [class*="card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  dashboardTest('Toggle between card and list view', async ({ workbenchPage }) => {
    // Wait for articles to load
    await workbenchPage.waitForTimeout(2_000);

    // Find the list view toggle button (ariaLabel: "Listenansicht" or "List view")
    const listViewBtn = workbenchPage.locator('button[title="Listenansicht"], button[title="List view"]');
    await expect(listViewBtn).toBeVisible({ timeout: 5_000 });
    await listViewBtn.click();

    // Assert list view is now visible (DetailsList renders a role="grid" element)
    const listView = workbenchPage.locator('[role="grid"], [class*="listView"], [class*="DetailsList"]');
    await expect(listView.first()).toBeVisible({ timeout: 5_000 });

    // Toggle back to card view
    const cardViewBtn = workbenchPage.locator('button[title="Kartenansicht"], button[title="Card view"]');
    await expect(cardViewBtn).toBeVisible();
    await cardViewBtn.click();

    // Assert card grid is visible again
    const cardGrid = workbenchPage.locator('[class*="cardGrid"]');
    await expect(cardGrid.first()).toBeVisible({ timeout: 5_000 });
  });

  dashboardTest('Search filters articles', async ({ workbenchPage }) => {
    // Wait for articles to load
    await workbenchPage.waitForTimeout(2_000);

    // Find search input (placeholder: "Artikel suchen..." or "Search articles...")
    const searchInput = workbenchPage.locator('input[placeholder*="suchen"], input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 5_000 });

    // Type search query matching "DSGVO-Grundlagen"
    await searchInput.fill('DSGVO');

    // Wait for debounced search to filter (300ms debounce + render time)
    await workbenchPage.waitForTimeout(1_000);

    // Assert "DSGVO-Grundlagen" is still visible
    await expect(workbenchPage.getByText('DSGVO-Grundlagen')).toBeVisible({ timeout: 5_000 });

    // Articles not matching the search should be filtered out
    // "VPN-Zugang einrichten" should not be visible when searching for "DSGVO"
    await expect(workbenchPage.getByText('VPN-Zugang einrichten')).not.toBeVisible({ timeout: 3_000 });

    // Clear search input
    await searchInput.fill('');
    await workbenchPage.waitForTimeout(500);
  });

  dashboardTest('Stats bar shows counts', async ({ workbenchPage }) => {
    // Wait for data to load
    await workbenchPage.waitForTimeout(2_000);

    // Stats bar should be visible with stat items
    const statsBar = workbenchPage.locator('[class*="statsBar"]');
    await expect(statsBar.first()).toBeVisible({ timeout: 5_000 });

    // Assert stat count elements are visible (unread count displayed as a number)
    const statCounts = workbenchPage.locator('[class*="statCount"]');
    const countElements = await statCounts.count();
    expect(countElements).toBeGreaterThanOrEqual(2); // At least unread + favorites
  });
});
