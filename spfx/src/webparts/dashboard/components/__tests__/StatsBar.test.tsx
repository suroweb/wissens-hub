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
}), { virtual: true });

jest.mock('SharedStrings', () => ({}), { virtual: true });

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { StatsBar, IStatsBarProps } from '../StatsBar';

describe('StatsBar (DASH-05, DASH-10)', () => {
  const mockStatClick = jest.fn();

  const defaultProps: IStatsBarProps = {
    unreadCount: 5,
    favoritesCount: 3,
    pendingReviewsCount: 2,
    activeStatFilter: '',
    onStatClick: mockStatClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders unread count', () => {
    renderWithContext(React.createElement(StatsBar, defaultProps));
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Ungelesen')).toBeInTheDocument();
  });

  it('renders favorites count', () => {
    renderWithContext(React.createElement(StatsBar, defaultProps));
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Favoriten')).toBeInTheDocument();
  });

  it('renders pending review count for reviewer role', () => {
    // Default renderWithContext uses admin role which is >= reviewer
    renderWithContext(React.createElement(StatsBar, defaultProps));
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Offen')).toBeInTheDocument();
  });

  it('hides pending reviews for reader role', () => {
    renderWithContext(React.createElement(StatsBar, defaultProps), { role: 'reader' });
    // Unread and favorites should still show
    expect(screen.getByText('Ungelesen')).toBeInTheDocument();
    expect(screen.getByText('Favoriten')).toBeInTheDocument();
    // Offen should be hidden by RoleGate
    expect(screen.queryByText('Offen')).toBeNull();
  });

  it('has aria-pressed attribute for accessibility', () => {
    renderWithContext(React.createElement(StatsBar, defaultProps));
    const unreadButton = screen.getByText('Ungelesen').closest('button');
    expect(unreadButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows active state when stat filter is active', () => {
    const activeProps = { ...defaultProps, activeStatFilter: 'unread' as const };
    renderWithContext(React.createElement(StatsBar, activeProps));
    const unreadButton = screen.getByText('Ungelesen').closest('button');
    expect(unreadButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onStatClick when stat button is clicked', () => {
    renderWithContext(React.createElement(StatsBar, defaultProps));
    const unreadButton = screen.getByText('Ungelesen').closest('button');
    if (unreadButton) {
      fireEvent.click(unreadButton);
    }
    expect(mockStatClick).toHaveBeenCalled();
  });
});
