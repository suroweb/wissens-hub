import { expect, resetWorkbenchState, createWebPartFixture } from '../fixtures/spfx-fixtures';

/**
 * E2E Flow: Admin Configuration (AdminPanel)
 * Verifies admin panel tab navigation, category management,
 * add category dialog, and overview stats display.
 *
 * Web part display name: "AdminPanel" (from manifest preconfiguredEntries)
 * Mock data: 5 categories (IT-Sicherheit, Datenschutz, etc.)
 * Note: AdminPanel is wrapped in RoleGate(minimumRole="admin").
 * In workbench mock mode, the mock role is set via manifest properties.
 */

const adminTest = createWebPartFixture('AdminPanel');

adminTest.describe.serial('Admin Config Flow', () => {
  adminTest.beforeEach(async ({ workbenchPage }) => {
    await resetWorkbenchState(workbenchPage);
  });

  adminTest('Admin panel renders with tabs', async ({ workbenchPage }) => {
    // Wait for admin panel container to be visible
    // AdminPanel section uses class "adminPanel"
    const container = workbenchPage.locator('[class*="adminPanel"]');
    await expect(container.first()).toBeVisible({ timeout: 15_000 });

    // Assert Pivot tabs visible
    // German: "Ubersicht", "Kategorien", "Zielgruppen", "Berichte"
    // English: "Overview", "Categories", "Target Groups", "Reports"
    const overviewTab = workbenchPage.locator(
      '[role="tab"]:has-text("bersicht"), [role="tab"]:has-text("Overview")'
    );
    await expect(overviewTab.first()).toBeVisible({ timeout: 10_000 });

    const categoriesTab = workbenchPage.locator(
      '[role="tab"]:has-text("Kategorien"), [role="tab"]:has-text("Categories")'
    );
    await expect(categoriesTab.first()).toBeVisible({ timeout: 5_000 });

    const targetGroupsTab = workbenchPage.locator(
      '[role="tab"]:has-text("Zielgruppen"), [role="tab"]:has-text("Target Groups")'
    );
    await expect(targetGroupsTab.first()).toBeVisible({ timeout: 5_000 });

    const reportsTab = workbenchPage.locator(
      '[role="tab"]:has-text("Berichte"), [role="tab"]:has-text("Reports")'
    );
    await expect(reportsTab.first()).toBeVisible({ timeout: 5_000 });
  });

  adminTest('Categories tab shows existing categories', async ({ workbenchPage }) => {
    // Click Kategorien tab
    const categoriesTab = workbenchPage.locator(
      '[role="tab"]:has-text("Kategorien"), [role="tab"]:has-text("Categories")'
    );
    await categoriesTab.first().click();
    await workbenchPage.waitForTimeout(2_000);

    // Mock categories: "IT-Sicherheit", "Datenschutz", "Onboarding", "Arbeitsprozesse", "Compliance"
    // DetailsList should render these as rows
    await expect(workbenchPage.getByText('IT-Sicherheit', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(workbenchPage.getByText('Datenschutz', { exact: true })).toBeVisible({ timeout: 5_000 });
    await expect(workbenchPage.getByText('Compliance', { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  adminTest('Add category dialog', async ({ workbenchPage }) => {
    // Navigate to Kategorien tab
    const categoriesTab = workbenchPage.locator(
      '[role="tab"]:has-text("Kategorien"), [role="tab"]:has-text("Categories")'
    );
    await categoriesTab.first().click();
    await workbenchPage.waitForTimeout(2_000);

    // Click "Hinzufuegen" / "Add" button from CommandBar
    const addBtn = workbenchPage.locator(
      'button:has-text("Hinzuf"), button:has-text("Add")'
    );
    await addBtn.first().click();
    await workbenchPage.waitForTimeout(500);

    // An inline row should appear in the DetailsList with text fields
    // Type "Neue Kategorie" in the name field (placeholder: "Kategorie-Name")
    const nameField = workbenchPage.locator(
      'input[placeholder*="Kategorie"], input[placeholder*="Name"]'
    ).first();
    await expect(nameField).toBeVisible({ timeout: 5_000 });
    await nameField.fill('Neue Kategorie');

    // Type "Beschreibung" in the description field
    const descField = workbenchPage.locator(
      'input[placeholder*="Beschreibung"], input[placeholder*="description"]'
    ).first();
    await expect(descField).toBeVisible({ timeout: 5_000 });
    await descField.fill('Test-Beschreibung');

    // Click save button (icon: Save)
    const saveBtn = workbenchPage.locator('button[title="Save"], button[title="Speichern"]');
    await saveBtn.first().click();
    await workbenchPage.waitForTimeout(1_000);

    // The new category should now appear in the list
    await expect(workbenchPage.getByText('Neue Kategorie')).toBeVisible({ timeout: 5_000 });
  });

  adminTest('Overview tab shows article stats', async ({ workbenchPage }) => {
    // Click Ubersicht tab (it is the default, but click to ensure)
    const overviewTab = workbenchPage.locator(
      '[role="tab"]:has-text("bersicht"), [role="tab"]:has-text("Overview")'
    );
    await overviewTab.first().click();
    await workbenchPage.waitForTimeout(2_000);

    // Overview tab shows StatsCards with article counts
    // Look for stats content: total articles count or status breakdown
    const statsContent = workbenchPage.locator(
      '[class*="statsCard"], [class*="tabContent"]'
    );
    await expect(statsContent.first()).toBeVisible({ timeout: 10_000 });

    // The DetailsList in overview should show article data
    // Look for any article title from mock data or status text
    const detailsList = workbenchPage.locator(
      '[role="grid"], [class*="DetailsList"]'
    );
    await expect(detailsList.first()).toBeVisible({ timeout: 10_000 });
  });
});
