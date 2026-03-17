jest.mock('FreigabecenterWebPartStrings', () => ({
  FreigabecenterTitle: 'Freigabecenter',
  TabPending: 'Ausstehend',
  TabFlagged: 'Markiert',
  TabStale: 'Veraltet',
  ReviewerLabel: 'Pruefer',
  AllReviewers: 'Alle Pruefer',
  ReviewerPrefix: 'Pruefer: ',
  Approve: 'Genehmigen',
  Reject: 'Ablehnen',
  FlaggedBy: 'Gemeldet von {0} am {1}',
  LastModified: 'Zuletzt geaendert: {0} ({1} Tage)',
  ApproveDialogTitle: 'Artikel genehmigen',
  CommentLabel: 'Kommentar (optional)',
  RejectDialogTitle: 'Artikel ablehnen',
  ReasonLabel: 'Ablehnungsgrund',
  ErrorLoadingFreigabecenter: 'Fehler beim Laden des Freigabecenters',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Cancel: 'Abbrechen',
  NotAssigned: 'Nicht zugewiesen',
  OpenArticle: 'Artikel oeffnen',
  DaysAgo: 'vor {0} Tagen',
  JustNow: 'Gerade eben',
  SecondsAgo: 'vor {0} Sekunden',
  OneMinuteAgo: 'vor 1 Minute',
  MinutesAgo: 'vor {0} Minuten',
  OneHourAgo: 'vor 1 Stunde',
  HoursAgo: 'vor {0} Stunden',
  Yesterday: 'Gestern',
  OneMonthAgo: 'vor 1 Monat',
  MonthsAgo: 'vor {0} Monaten',
}), { virtual: true });

// Mock the query hooks to return controlled data
const mockPendingQuery = {
  state: { status: 'success' as const, data: [] as IArticlePage[] },
  refetch: jest.fn(),
};
const mockFlaggedQuery = {
  state: { status: 'success' as const, data: [] as IFlag[] },
  refetch: jest.fn(),
};
const mockArticlesQuery = {
  state: { status: 'success' as const, data: [] as IArticlePage[] },
  refetch: jest.fn(),
};
const mockApproveCommand = {
  state: { status: 'idle' as const },
  execute: jest.fn().mockResolvedValue(true),
};
const mockRejectCommand = {
  state: { status: 'idle' as const },
  execute: jest.fn().mockResolvedValue(true),
};

jest.mock('../../../../shared/hooks/queries', () => ({
  usePendingApprovalsQuery: () => mockPendingQuery,
  useFlaggedArticlesQuery: () => mockFlaggedQuery,
  useArticlesQuery: () => mockArticlesQuery,
}));

jest.mock('../../../../shared/hooks/commands', () => ({
  useApproveArticleCommand: () => mockApproveCommand,
  useRejectArticleCommand: () => mockRejectCommand,
}));

jest.mock('../../../../shared/context', () => ({
  useWissensHub: () => ({ isLoading: false }),
}));

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Freigabecenter from '../Freigabecenter';
import { IArticlePage } from '../../../../shared/models/domain/IArticlePage';
import { IFlag } from '../../../../shared/models/domain/IFlag';

const MOCK_PENDING: IArticlePage[] = [
  {
    id: 7,
    title: 'Datensicherung-Konzept',
    category: 'IT-Sicherheit',
    status: 'InReview',
    isMandatory: false,
    targetGroups: ['IT-Abteilung'],
    modifiedDate: new Date('2026-03-10T13:00:00Z'),
    author: { displayName: 'Stefan Braun', email: 'stefan.braun@contoso.de' },
    reviewerName: 'Anna Schmidt',
    reviewByDate: new Date('2026-04-01T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/Datensicherung-Konzept.aspx',
  },
];

const MOCK_FLAGS: IFlag[] = [
  {
    id: 1,
    pageId: 9,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    reason: 'Regelung wird derzeit ueberarbeitet',
    flaggedDate: new Date('2026-03-10T16:00:00Z'),
  },
];

const DEFAULT_PROPS = {
  description: 'Freigabecenter',
  isDarkTheme: false,
  environmentMessage: 'local',
  hasTeamsContext: false,
  userDisplayName: 'Max Mustermann',
};

describe('Freigabecenter', () => {
  beforeEach(() => {
    mockPendingQuery.state = { status: 'success', data: MOCK_PENDING };
    mockFlaggedQuery.state = { status: 'success', data: MOCK_FLAGS };
    mockArticlesQuery.state = { status: 'success', data: [] };
  });

  it('renders without crashing', () => {
    render(React.createElement(Freigabecenter, DEFAULT_PROPS));
    expect(screen.getByText('Freigabecenter')).toBeInTheDocument();
  });

  it('renders Pivot with three tabs (Ausstehend, Markiert, Veraltet)', () => {
    render(React.createElement(Freigabecenter, DEFAULT_PROPS));
    // Tab headers include counts
    expect(screen.getByText(/Ausstehend/)).toBeInTheDocument();
    expect(screen.getByText(/Markiert/)).toBeInTheDocument();
    expect(screen.getByText(/Veraltet/)).toBeInTheDocument();
  });

  it('renders reviewer filter dropdown', () => {
    render(React.createElement(Freigabecenter, DEFAULT_PROPS));
    expect(screen.getByText('Pruefer')).toBeInTheDocument();
  });
});
