jest.mock('@pnp/sp', () => ({ spfi: jest.fn(), SPFx: jest.fn() }));
jest.mock('@pnp/queryable', () => ({ Caching: jest.fn() }));
jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));
jest.mock('@pnp/sp/site-users/web', () => ({}));
jest.mock('@pnp/sp/site-groups/web', () => ({}));
jest.mock('@microsoft/sp-http', () => ({}));
jest.mock('../../../../shared/context/pnpSetup', () => ({ getSP: jest.fn() }));

jest.mock('SharedStrings', () => ({
  ErrorOccurred: 'An error occurred',
  Reload: 'Reload',
}), { virtual: true });

jest.mock('ArticleSidebarWebPartStrings', () => ({
  SubmitForReview: 'Zur Pruefung einreichen',
  Archive: 'Archivieren',
  Restore: 'Wiederherstellen',
  SubmittedForReview: 'Zur Pruefung eingereicht',
  ArticleArchived: 'Artikel archiviert',
  ArticleRestored: 'Artikel wiederhergestellt',
}), { virtual: true });

const mockSubmitForReview = jest.fn().mockResolvedValue(true);
const mockArchiveArticle = jest.fn().mockResolvedValue(true);
const mockRestoreArticle = jest.fn().mockResolvedValue(true);

jest.mock('../../../../shared/hooks/commands', () => ({
  useSubmitForReviewCommand: () => ({
    state: { status: 'idle' },
    execute: mockSubmitForReview,
  }),
  useArchiveArticleCommand: () => ({
    state: { status: 'idle' },
    execute: mockArchiveArticle,
  }),
  useRestoreArticleCommand: () => ({
    state: { status: 'idle' },
    execute: mockRestoreArticle,
  }),
}));

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { ApprovalActions, IApprovalActionsProps } from '../ApprovalActions';

describe('ApprovalActions (APPR-01, APPR-03)', () => {
  const onStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows submit button for Draft articles (editor role)', () => {
    const props: IApprovalActionsProps = {
      pageId: 5,
      articleStatus: 'Draft',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'editor' }
    );
    expect(screen.getByText('Zur Pruefung einreichen')).toBeInTheDocument();
  });

  it('shows archive button for Published articles (reviewer role)', () => {
    const props: IApprovalActionsProps = {
      pageId: 1,
      articleStatus: 'Published',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'reviewer' }
    );
    expect(screen.getByText('Archivieren')).toBeInTheDocument();
  });

  it('shows restore button for Archived articles (reviewer role)', () => {
    const props: IApprovalActionsProps = {
      pageId: 8,
      articleStatus: 'Archived',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'reviewer' }
    );
    expect(screen.getByText('Wiederherstellen')).toBeInTheDocument();
  });

  it('hides submit button for Draft articles when user is reader', () => {
    const props: IApprovalActionsProps = {
      pageId: 5,
      articleStatus: 'Draft',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'reader' }
    );
    expect(screen.queryByText('Zur Pruefung einreichen')).toBeNull();
  });

  it('hides archive button for Published when user is reader', () => {
    const props: IApprovalActionsProps = {
      pageId: 1,
      articleStatus: 'Published',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'reader' }
    );
    expect(screen.queryByText('Archivieren')).toBeNull();
  });

  it('calls onStatusChange after successful submit for review', async () => {
    const props: IApprovalActionsProps = {
      pageId: 5,
      articleStatus: 'Draft',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'editor' }
    );
    fireEvent.click(screen.getByText('Zur Pruefung einreichen'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockSubmitForReview).toHaveBeenCalledWith(5);
  });

  it('does not render action buttons for InReview status (no matching condition)', () => {
    const props: IApprovalActionsProps = {
      pageId: 7,
      articleStatus: 'InReview',
      onStatusChange: onStatusChange,
    };
    renderWithContext(
      React.createElement(ApprovalActions, props),
      { role: 'editor' }
    );
    expect(screen.queryByText('Zur Pruefung einreichen')).toBeNull();
    expect(screen.queryByText('Archivieren')).toBeNull();
    expect(screen.queryByText('Wiederherstellen')).toBeNull();
  });
});
