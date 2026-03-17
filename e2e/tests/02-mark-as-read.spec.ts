import { expect, resetWorkbenchState } from '../fixtures/spfx-fixtures';

/**
 * E2E Flow: Mark-as-Read (ArticleSidebar)
 * Verifies sidebar metadata display, read confirmation, and favorite toggle
 * against the SharePoint workbench with mock data.
 *
 * Web part display name: "ArticleSidebar" (from manifest preconfiguredEntries)
 * Mock data: ArticleSidebar renders article metadata from MockPageService
 * and read status from MockReadConfirmationService.
 */

import { createWebPartFixture } from '../fixtures/spfx-fixtures';

const sidebarTest = createWebPartFixture('ArticleSidebar');

sidebarTest.describe.serial('Mark-as-Read Flow', () => {
  sidebarTest.beforeEach(async ({ workbenchPage }) => {
    await resetWorkbenchState(workbenchPage);
  });

  sidebarTest('Sidebar renders article metadata', async ({ workbenchPage }) => {
    // Wait for sidebar content to be visible
    // The ArticleSidebar web part renders with aria-label="Article Sidebar"
    const sidebar = workbenchPage.locator('[aria-label="Article Sidebar"], [class*="articleSidebar"]');
    await expect(sidebar.first()).toBeVisible({ timeout: 15_000 });

    // Metadata section should show article info from mock data
    // MockPageService provides article details including category and author
    const metadataSection = workbenchPage.locator('[class*="metadata"], [class*="metadataSection"]');
    await expect(metadataSection.first()).toBeVisible({ timeout: 10_000 });
  });

  sidebarTest('Mark-as-read button works', async ({ workbenchPage }) => {
    // Wait for sidebar to fully render
    await workbenchPage.waitForTimeout(3_000);

    // Look for the mark-as-read button
    // German: "Als gelesen markieren" / "Lesebestatigung erneuern"
    // English: "Mark as read" / "Reconfirm reading"
    // The button uses sharedStrings.MarkAsRead or strings.ReconfirmReading
    const markAsReadBtn = workbenchPage.locator(
      'button:has-text("gelesen"), button:has-text("Mark as read"), button:has-text("Reconfirm")'
    );

    // If the article is already read (mock data has pre-populated read confirmations),
    // a read confirmation display may be shown instead of the button.
    // Check for either the button or the read confirmation display.
    const readConfirmed = workbenchPage.locator(
      '[class*="readConfirmed"], :text("Gelesen am"), :text("Read on")'
    );

    const hasButton = await markAsReadBtn.count();
    const hasConfirmed = await readConfirmed.count();

    // Either the mark-as-read button or the read confirmation should be visible
    expect(hasButton + hasConfirmed).toBeGreaterThan(0);

    // If the button is visible, click it and verify the read confirmation appears
    if (hasButton > 0) {
      await markAsReadBtn.first().click();
      await workbenchPage.waitForTimeout(1_000);

      // After clicking, either a read confirmation icon or date should appear
      const readStatus = workbenchPage.locator(
        '[class*="readConfirmed"], [class*="readCheck"], :text("Gelesen am"), :text("Read on")'
      );
      await expect(readStatus.first()).toBeVisible({ timeout: 5_000 });
    }
  });

  sidebarTest('Favorite toggle works', async ({ workbenchPage }) => {
    // Wait for sidebar to render
    await workbenchPage.waitForTimeout(2_000);

    // Find the favorite toggle button (star icon)
    // It uses iconName "FavoriteStar" or "FavoriteStarFill"
    const favoriteBtn = workbenchPage.locator(
      'button[class*="favorit"], button i[data-icon-name="FavoriteStar"], button i[data-icon-name="FavoriteStarFill"]'
    ).first();

    // Get parent button if we found the icon
    const starButton = workbenchPage.locator(
      '[class*="favoritedStar"], [class*="unfavoritedStar"]'
    ).first();

    await expect(starButton).toBeVisible({ timeout: 5_000 });

    // Capture current state
    const initialClass = await starButton.getAttribute('class') || '';

    // Click to toggle favorite state
    await starButton.click();
    await workbenchPage.waitForTimeout(500);

    // After toggle, the class should change (favorited <-> unfavorited)
    const newClass = await starButton.getAttribute('class') || '';
    // The visual state should have changed (either gained or lost "favorited" styling)
    expect(newClass).not.toBe(initialClass);
  });
});
