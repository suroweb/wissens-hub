import { expect, resetWorkbenchState, createWebPartFixture } from '../fixtures/spfx-fixtures';

/**
 * E2E Flow: Approve Article (Freigabecenter)
 * Verifies the approval workflow: tab navigation, pending articles,
 * approve dialog submission, and flagged articles display.
 *
 * Web part display name: "Freigabecenter" (from manifest preconfiguredEntries)
 * Mock data: 1 InReview article ("Datensicherung-Konzept"), 1 flagged article
 */

const freigabeTest = createWebPartFixture('Freigabecenter');

freigabeTest.describe.serial('Approve Article Flow', () => {
  freigabeTest.beforeEach(async ({ workbenchPage }) => {
    await resetWorkbenchState(workbenchPage);
  });

  freigabeTest('Freigabecenter renders with tabs', async ({ workbenchPage }) => {
    // Wait for the Freigabecenter web part container to be visible
    const container = workbenchPage.locator(
      '[aria-label="Freigabecenter"], [class*="freigabecenter"]'
    );
    await expect(container.first()).toBeVisible({ timeout: 15_000 });

    // Assert Pivot tabs are visible
    // German locale: "Ausstehend (N)", "Gemeldet (N)", "Veraltet (N)"
    // English: "Pending (N)", "Flagged (N)", "Stale (N)"
    const pendingTab = workbenchPage.locator(
      '[role="tab"]:has-text("Ausstehend"), [role="tab"]:has-text("Pending")'
    );
    await expect(pendingTab.first()).toBeVisible({ timeout: 10_000 });

    const flaggedTab = workbenchPage.locator(
      '[role="tab"]:has-text("Gemeldet"), [role="tab"]:has-text("Flagged")'
    );
    await expect(flaggedTab.first()).toBeVisible({ timeout: 5_000 });

    const staleTab = workbenchPage.locator(
      '[role="tab"]:has-text("Veraltet"), [role="tab"]:has-text("Stale")'
    );
    await expect(staleTab.first()).toBeVisible({ timeout: 5_000 });
  });

  freigabeTest('Pending tab shows articles awaiting approval', async ({ workbenchPage }) => {
    // Wait for data to load
    await workbenchPage.waitForTimeout(3_000);

    // Click pending tab if not default (it is the first tab so likely active)
    const pendingTab = workbenchPage.locator(
      '[role="tab"]:has-text("Ausstehend"), [role="tab"]:has-text("Pending")'
    );
    await pendingTab.first().click();
    await workbenchPage.waitForTimeout(1_000);

    // Mock data has 1 InReview article: "Datensicherung-Konzept"
    await expect(
      workbenchPage.getByText('Datensicherung-Konzept')
    ).toBeVisible({ timeout: 10_000 });

    // Approve and reject buttons should be visible for the pending article
    const approveBtn = workbenchPage.locator(
      'button:has-text("Genehmigen"), button:has-text("Approve")'
    );
    await expect(approveBtn.first()).toBeVisible({ timeout: 5_000 });

    const rejectBtn = workbenchPage.locator(
      'button:has-text("Ablehnen"), button:has-text("Reject")'
    );
    await expect(rejectBtn.first()).toBeVisible({ timeout: 5_000 });
  });

  freigabeTest('Approve dialog opens and submits', async ({ workbenchPage }) => {
    // Wait for data to load
    await workbenchPage.waitForTimeout(3_000);

    // Click pending tab
    const pendingTab = workbenchPage.locator(
      '[role="tab"]:has-text("Ausstehend"), [role="tab"]:has-text("Pending")'
    );
    await pendingTab.first().click();
    await workbenchPage.waitForTimeout(1_000);

    // Click approve button on the first pending article
    const approveBtn = workbenchPage.locator(
      'button:has-text("Genehmigen"), button:has-text("Approve")'
    );
    await approveBtn.first().click();

    // Wait for dialog to appear
    // ApproveDialog uses Dialog component with title "Artikel genehmigen" / "Approve article"
    const dialog = workbenchPage.locator('[role="dialog"]');
    await expect(dialog.first()).toBeVisible({ timeout: 5_000 });

    // Type comment in the comment field
    // CommentLabel: "Kommentar" / "Comment"
    const commentField = dialog.locator('textarea, input[type="text"]').first();
    await commentField.fill('Inhalt geprueft');

    // Click the submit/confirm button inside the dialog
    const submitBtn = dialog.locator(
      'button:has-text("Genehmigen"), button:has-text("Approve")'
    );
    await submitBtn.first().click();

    // Wait for dialog to close (optimistic removal)
    await workbenchPage.waitForTimeout(1_000);

    // Dialog should be closed
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });

    // The article should be removed from the pending list (optimistic removal)
    await expect(
      workbenchPage.getByText('Datensicherung-Konzept')
    ).not.toBeVisible({ timeout: 5_000 });
  });

  freigabeTest('Flagged tab shows flagged articles', async ({ workbenchPage }) => {
    // Click on flagged tab
    const flaggedTab = workbenchPage.locator(
      '[role="tab"]:has-text("Gemeldet"), [role="tab"]:has-text("Flagged")'
    );
    await flaggedTab.first().click();
    await workbenchPage.waitForTimeout(1_000);

    // Mock data has 1 flag on article pageId 9 ("Homeoffice-Regelung")
    // with reason: "Regelung wird derzeit ueberarbeitet..."
    // The flagged tab shows the flag reason and the article title
    const flaggedContent = workbenchPage.locator(
      ':text("Homeoffice-Regelung"), :text("derzeit"), :text("Regelung")'
    );
    await expect(flaggedContent.first()).toBeVisible({ timeout: 10_000 });
  });
});
