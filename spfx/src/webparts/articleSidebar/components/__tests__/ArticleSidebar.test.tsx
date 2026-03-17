/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@pnp/sp', () => ({ spfi: jest.fn(), SPFx: jest.fn() }));
jest.mock('@pnp/queryable', () => ({ Caching: jest.fn() }));
jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));
jest.mock('@pnp/sp/site-users/web', () => ({}));
jest.mock('@pnp/sp/site-groups/web', () => ({}));
jest.mock('@microsoft/sp-http', () => ({}));

jest.mock('../../../../shared/context/pnpSetup', () => ({
  getSP: jest.fn(),
}));

jest.mock('ArticleSidebarWebPartStrings', () => ({
  ErrorLoadingArticleData: 'Error loading article data',
  VersionHistory: 'Version History',
  EditMetadata: 'Edit Metadata',
  MandatoryReadRequired: 'Pflichtartikel',
  ArticleUpdatedReconfirm: 'Article updated',
  PreviouslyReadOn: 'Previously read on {0}',
  ReconfirmReading: 'Reconfirm',
  ReadOn: 'Read on {0}',
  ReportedOn: 'Reported on {0}',
  ReportAsOutdated: 'Report as outdated',
  FlagDialogTitle: 'Flag Dialog',
  FlagDialogSubText: 'Flag sub text',
  ReasonLabel: 'Reason',
  TableOfContents: 'Table of Contents',
  SubmitForReview: 'Submit for Review',
  Archive: 'Archive',
  Restore: 'Restore',
  SubmittedForReview: 'Submitted',
  ArticleArchived: 'Archived',
  ArticleRestored: 'Restored',
  ApprovalHistoryTitle: 'Approval History',
  NoActionsYet: 'No actions yet',
  ErrorLoadingHistory: 'Error loading history',
  ActionApproved: 'Approved',
  ActionRestored: 'Restored',
  ActionRejected: 'Rejected',
  ActionSubmitted: 'Submitted',
  ActionArchived: 'Archived',
  ActionByUser: '{0} by {1}',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Author: 'Author',
  Category: 'Category',
  LastUpdated: 'Last Updated',
  Version: 'Version',
  Status: 'Status',
  TargetGroups: 'Target Groups',
  MarkAsRead: 'Mark as read',
  Submit: 'Submit',
  Cancel: 'Cancel',
  RemoveFavorite: 'Remove favorite',
  AddFavorite: 'Add favorite',
  Loading: 'Loading...',
}), { virtual: true });

const mockArticleStatusQuery = {
  state: { status: 'loading' as const },
  refetch: jest.fn(),
};
const mockFavoritesQuery = {
  state: { status: 'success' as const, data: [] as any[] },
  refetch: jest.fn(),
};

jest.mock('../../../../shared/hooks', () => ({
  useArticleStatusQuery: () => mockArticleStatusQuery,
  useFavoritesQuery: () => mockFavoritesQuery,
}));

jest.mock('../../../../shared/hooks/commands', () => ({
  useMarkAsReadCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
  useToggleFavoriteCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
  useFlagArticleCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
  useSubmitForReviewCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
  useArchiveArticleCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
  useRestoreArticleCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
}));

jest.mock('../../../../shared/hooks/queries', () => ({
  useApprovalHistoryQuery: () => ({
    state: { status: 'success', data: [] },
    refetch: jest.fn(),
  }),
}));

import * as React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import ArticleSidebar from '../ArticleSidebar';
import { MOCK_ARTICLES } from '../../../../shared/services/__mocks__/mockData';

describe('ArticleSidebar (SIDE-01, SIDE-07)', () => {
  const defaultProps = {
    pageId: 1,
    listId: '{MOCK-LIST-ID}',
    siteUrl: 'https://contoso.sharepoint.com/sites/WissensHub',
    hasTeamsContext: false,
  };

  beforeEach(() => {
    mockArticleStatusQuery.state = { status: 'loading' as const };
    mockArticleStatusQuery.refetch = jest.fn();
    mockFavoritesQuery.state = { status: 'success' as const, data: [] };
  });

  it('renders shimmer loading state when article status is loading', () => {
    mockArticleStatusQuery.state = { status: 'loading' as const };
    renderWithContext(React.createElement(ArticleSidebar, defaultProps));
    // Shimmer container should be rendered
    const shimmerContainer = document.querySelector('[class*="shimmerContainer"]');
    expect(shimmerContainer).toBeTruthy();
  });

  it('renders error message bar when article status fails', () => {
    mockArticleStatusQuery.state = {
      status: 'error' as const,
      error: { message: 'Network error', code: 'NETWORK' },
    } as any;
    renderWithContext(React.createElement(ArticleSidebar, defaultProps));
    // MessageBar with error type should be rendered
    const errorBar = document.querySelector('.ms-MessageBar--error');
    expect(errorBar).toBeTruthy();
  });

  it('renders metadata section after data loads', () => {
    const article = MOCK_ARTICLES[0]; // Published, mandatory
    mockArticleStatusQuery.state = {
      status: 'success' as const,
      data: {
        article: article,
        readConfirmation: undefined,
        contentVersion: 1,
      },
    } as any;
    renderWithContext(React.createElement(ArticleSidebar, defaultProps));
    // MetadataSection should render the author name
    expect(screen.getByText(article.author.displayName)).toBeInTheDocument();
  });

  it('renders version history link with correct URL', () => {
    const article = MOCK_ARTICLES[0];
    mockArticleStatusQuery.state = {
      status: 'success' as const,
      data: {
        article: article,
        readConfirmation: undefined,
        contentVersion: 1,
      },
    } as any;
    renderWithContext(React.createElement(ArticleSidebar, defaultProps));
    const link = screen.getByText('Version History');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href',
      expect.stringContaining('_layouts/15/Versions.aspx'));
  });

  it('renders sidebar with aria-label', () => {
    const article = MOCK_ARTICLES[0];
    mockArticleStatusQuery.state = {
      status: 'success' as const,
      data: {
        article: article,
        readConfirmation: undefined,
        contentVersion: 1,
      },
    } as any;
    renderWithContext(React.createElement(ArticleSidebar, defaultProps));
    expect(screen.getByLabelText('Article Sidebar')).toBeInTheDocument();
  });
});
