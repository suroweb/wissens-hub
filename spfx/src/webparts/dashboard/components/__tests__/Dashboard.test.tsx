/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@pnp/sp', () => ({ spfi: jest.fn(), SPFx: jest.fn() }));
jest.mock('@pnp/queryable', () => ({ Caching: jest.fn() }));
jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));
jest.mock('@pnp/sp/site-users/web', () => ({}));
jest.mock('@pnp/sp/site-groups/web', () => ({}));
jest.mock('@pnp/sp/search', () => ({}));
jest.mock('@microsoft/sp-http', () => ({}));

jest.mock('DashboardWebPartStrings', () => ({
  Unread: 'Ungelesen',
  Favorites: 'Favoriten',
  OpenForReview: 'Offen',
  CategoryPlaceholder: 'Kategorie',
  StatusPlaceholder: 'Status',
  TargetGroupPlaceholder: 'Zielgruppe',
  CardView: 'Kartenansicht',
  ListView: 'Listenansicht',
  NewArticle: 'Neuer Artikel',
  RemoveFilterLabel: '{0} entfernen',
  SearchPlaceholder: 'Artikel suchen...',
  ClearFilters: 'Filter zurücksetzen',
  NoResultsFor: 'Keine Ergebnisse',
  NoFilterMatch: 'Keine Treffer',
  EmptyHub: 'Noch keine Artikel',
  ColumnTitle: 'Titel',
  ColumnCategory: 'Kategorie',
  ColumnAuthor: 'Autor',
  ColumnModified: 'Geändert',
  ErrorLoadingArticles: 'Fehler beim Laden der Artikel',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  MandatoryArticle: 'Pflichtartikel',
  RemoveFavorite: 'Favorit entfernen',
  AddFavorite: 'Favorit hinzufügen',
  StatusDraft: 'Entwurf',
  StatusInReview: 'In Prüfung',
  StatusPublished: 'Veröffentlicht',
  StatusArchived: 'Archiviert',
  Category: 'Kategorie',
  TargetGroup: 'Zielgruppe',
  Status: 'Status',
  AllFilter: 'Alle',
  Loading: 'Laden...',
  JustNow: 'Gerade eben',
  SecondsAgo: 'vor {0} Sekunden',
  OneMinuteAgo: 'vor 1 Minute',
  MinutesAgo: 'vor {0} Minuten',
  OneHourAgo: 'vor 1 Stunde',
  HoursAgo: 'vor {0} Stunden',
  Yesterday: 'Gestern',
  DaysAgo: 'vor {0} Tagen',
  OneMonthAgo: 'vor 1 Monat',
  MonthsAgo: 'vor {0} Monaten',
  InSeconds: 'in {0} Sekunden',
  InOneMinute: 'in 1 Minute',
  InMinutes: 'in {0} Minuten',
  InOneHour: 'in 1 Stunde',
  InHours: 'in {0} Stunden',
  Tomorrow: 'Morgen',
  InDays: 'in {0} Tagen',
  InOneMonth: 'in 1 Monat',
  InMonths: 'in {0} Monaten',
}), { virtual: true });

const mockArticlesQuery = {
  state: { status: 'loading' as const },
  refetch: jest.fn(),
};
const mockFavoritesQuery = {
  state: { status: 'success' as const, data: [] as any[] },
  refetch: jest.fn(),
};
const mockPendingApprovalsQuery = {
  state: { status: 'success' as const, data: [] as any[] },
  refetch: jest.fn(),
};

jest.mock('../../../../shared/hooks/queries/useArticlesQuery', () => ({
  useArticlesQuery: () => mockArticlesQuery,
}));

jest.mock('../../../../shared/hooks/queries/useFavoritesQuery', () => ({
  useFavoritesQuery: () => mockFavoritesQuery,
}));

jest.mock('../../../../shared/hooks/commands/useToggleFavoriteCommand', () => ({
  useToggleFavoriteCommand: () => ({ state: { status: 'idle' }, execute: jest.fn().mockResolvedValue(true) }),
}));

jest.mock('../../../../shared/hooks/queries/usePendingApprovalsQuery', () => ({
  usePendingApprovalsQuery: () => mockPendingApprovalsQuery,
}));

jest.mock('../../../../shared/context/pnpSetup', () => ({
  getSP: jest.fn().mockReturnValue({
    web: { select: jest.fn().mockReturnValue(jest.fn().mockResolvedValue({ Url: 'https://contoso.sharepoint.com/sites/WissensHub' })) },
    search: jest.fn().mockResolvedValue({ PrimarySearchResults: [] }),
  }),
}));

import * as React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import Dashboard from '../Dashboard';
import { MOCK_ARTICLES } from '../../../../shared/services/__mocks__/mockData';

describe('Dashboard (DASH-01, DASH-08)', () => {
  const defaultProps = {
    description: 'Test',
    isDarkTheme: false,
    environmentMessage: '',
    hasTeamsContext: false,
    userDisplayName: 'Max Mustermann',
    containerWidth: 1024,
  };

  beforeEach(() => {
    mockArticlesQuery.state = { status: 'loading' as const };
    mockArticlesQuery.refetch = jest.fn();
    mockFavoritesQuery.state = { status: 'success' as const, data: [] };
    mockPendingApprovalsQuery.state = { status: 'success' as const, data: [] };
  });

  it('renders without crashing', () => {
    renderWithContext(React.createElement(Dashboard, defaultProps));
    // Should render the main section
    expect(document.querySelector('[role="main"]')).toBeTruthy();
  });

  it('shows shimmer loading state when articles are loading', () => {
    mockArticlesQuery.state = { status: 'loading' as const };
    const { container } = renderWithContext(React.createElement(Dashboard, defaultProps));
    // ShimmerCard components should render during loading
    expect(container.querySelector('[class*="shimmer"]')).toBeTruthy();
  });

  it('renders article cards after data loads', () => {
    const publishedArticles = MOCK_ARTICLES.filter(a => a.status === 'Published');
    mockArticlesQuery.state = {
      status: 'success' as const,
      data: publishedArticles,
    } as any;
    renderWithContext(React.createElement(Dashboard, defaultProps));
    // Should render article cards - check for the first article title
    expect(screen.getByText('Passwort-Richtlinie')).toBeInTheDocument();
  });

  it('shows error message when articles fail to load', () => {
    mockArticlesQuery.state = {
      status: 'error' as const,
      error: { message: 'Network error', code: 'NETWORK' },
    } as any;
    renderWithContext(React.createElement(Dashboard, defaultProps));
    expect(screen.getByText('Fehler beim Laden der Artikel')).toBeInTheDocument();
  });

  it('shows empty state when no articles match filters', () => {
    mockArticlesQuery.state = {
      status: 'success' as const,
      data: [],
    } as any;
    renderWithContext(React.createElement(Dashboard, defaultProps));
    expect(screen.getByText('Noch keine Artikel')).toBeInTheDocument();
  });
});
