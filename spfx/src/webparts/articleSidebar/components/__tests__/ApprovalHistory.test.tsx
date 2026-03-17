/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@pnp/sp', () => ({ spfi: jest.fn(), SPFx: jest.fn() }));
jest.mock('@pnp/queryable', () => ({ Caching: jest.fn() }));
jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));
jest.mock('@pnp/sp/site-users/web', () => ({}));
jest.mock('@pnp/sp/site-groups/web', () => ({}));
jest.mock('@microsoft/sp-http', () => ({}));
jest.mock('../../../../shared/context/pnpSetup', () => ({ getSP: jest.fn() }));

jest.mock('ArticleSidebarWebPartStrings', () => ({
  ApprovalHistoryTitle: 'Genehmigungsverlauf',
  NoActionsYet: 'Noch keine Aktionen',
  ErrorLoadingHistory: 'Fehler beim Laden',
  ActionApproved: 'Genehmigt',
  ActionRestored: 'Wiederhergestellt',
  ActionRejected: 'Abgelehnt',
  ActionSubmitted: 'Eingereicht',
  ActionArchived: 'Archiviert',
  ActionByUser: '{0} von {1}',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Loading: 'Laden...',
}), { virtual: true });

const mockHistoryQuery: any = {
  state: { status: 'success', data: [] },
  refetch: jest.fn(),
};

jest.mock('../../../../shared/hooks/queries', () => ({
  useApprovalHistoryQuery: () => mockHistoryQuery,
}));

import * as React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { ApprovalHistory } from '../ApprovalHistory';
import { MOCK_APPROVAL_HISTORY } from '../../../../shared/services/__mocks__/mockData';

describe('ApprovalHistory (APPR-02)', () => {
  beforeEach(() => {
    mockHistoryQuery.state = { status: 'success', data: [] };
  });

  it('renders approval history title', () => {
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    expect(screen.getByText('Genehmigungsverlauf')).toBeInTheDocument();
  });

  it('renders empty state when history is empty', () => {
    mockHistoryQuery.state = { status: 'success', data: [] };
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    expect(screen.getByText('Noch keine Aktionen')).toBeInTheDocument();
  });

  it('renders list of approval actions', () => {
    mockHistoryQuery.state = { status: 'success', data: MOCK_APPROVAL_HISTORY };
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    // First action: InReview -> Published = "Genehmigt von Klaus Weber"
    expect(screen.getByText('Genehmigt von Klaus Weber')).toBeInTheDocument();
    // Second action: Draft -> InReview = "Eingereicht von Stefan Braun"
    expect(screen.getByText('Eingereicht von Stefan Braun')).toBeInTheDocument();
  });

  it('renders action date in German format', () => {
    mockHistoryQuery.state = { status: 'success', data: MOCK_APPROVAL_HISTORY };
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    // First action date: 2026-01-10 -> 10.01.2026
    expect(screen.getByText('10.01.2026')).toBeInTheDocument();
    // Second action date: 2026-03-08 -> 08.03.2026
    expect(screen.getByText('08.03.2026')).toBeInTheDocument();
  });

  it('renders comment when present', () => {
    mockHistoryQuery.state = { status: 'success', data: MOCK_APPROVAL_HISTORY };
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    // First action has a comment
    expect(screen.getByText('Inhalt gepr\u00fcft und freigegeben')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockHistoryQuery.state = { status: 'loading' };
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    expect(screen.getByText('Laden...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockHistoryQuery.state = {
      status: 'error',
      error: { message: 'Network error', code: 'NETWORK' },
    };
    renderWithContext(React.createElement(ApprovalHistory, { pageId: 1 }));
    expect(screen.getByText('Fehler beim Laden')).toBeInTheDocument();
  });
});
