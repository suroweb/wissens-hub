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
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  MandatoryArticle: 'Pflichtartikel',
  RemoveFavorite: 'Favorit entfernen',
  AddFavorite: 'Favorit hinzufügen',
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

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { ArticleCard, IArticleCardProps } from '../ArticleCard';
import { MOCK_ARTICLES } from '../../../../shared/services/__mocks__/mockData';

describe('ArticleCard (DASH-01, DASH-02, DASH-03, DASH-04, RMND-01)', () => {
  const mockOnClick = jest.fn();
  const mockOnFavoriteToggle = jest.fn();

  const defaultProps: IArticleCardProps = {
    article: MOCK_ARTICLES[0], // Passwort-Richtlinie, mandatory, IT-Sicherheit
    isUnread: true,
    isFavorite: false,
    onFavoriteToggle: mockOnFavoriteToggle,
    onClick: mockOnClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders article title', () => {
    renderWithContext(React.createElement(ArticleCard, defaultProps));
    expect(screen.getByText('Passwort-Richtlinie')).toBeInTheDocument();
  });

  it('renders article category', () => {
    renderWithContext(React.createElement(ArticleCard, defaultProps));
    expect(screen.getByText('IT-Sicherheit')).toBeInTheDocument();
  });

  it('renders author name', () => {
    renderWithContext(React.createElement(ArticleCard, defaultProps));
    expect(screen.getByText(/Anna Schmidt/)).toBeInTheDocument();
  });

  it('shows mandatory badge when isMandatory is true', () => {
    renderWithContext(React.createElement(ArticleCard, defaultProps));
    expect(screen.getByText('Pflichtartikel')).toBeInTheDocument();
  });

  it('does not show mandatory badge when isMandatory is false', () => {
    const nonMandatory = {
      ...defaultProps,
      article: MOCK_ARTICLES[3], // VPN-Zugang einrichten, not mandatory
    };
    renderWithContext(React.createElement(ArticleCard, nonMandatory));
    expect(screen.queryByText('Pflichtartikel')).toBeNull();
  });

  it('shows unread indicator when article is unread', () => {
    const { container } = renderWithContext(React.createElement(ArticleCard, defaultProps));
    // Unread card gets the 'unread' CSS class
    expect(container.querySelector('[class*="unread"]')).toBeTruthy();
  });

  it('does not show unread indicator for read articles', () => {
    const readProps = { ...defaultProps, isUnread: false };
    const { container } = renderWithContext(React.createElement(ArticleCard, readProps));
    // Card should not have unread class
    const card = container.querySelector('[role="article"]');
    expect(card).toBeTruthy();
    const className = card ? card.getAttribute('class') || '' : '';
    expect(className.indexOf('unread')).toBe(-1);
  });

  it('calls onClick when card is clicked', () => {
    renderWithContext(React.createElement(ArticleCard, defaultProps));
    fireEvent.click(screen.getByRole('article'));
    expect(mockOnClick).toHaveBeenCalledWith(MOCK_ARTICLES[0].url);
  });
});
