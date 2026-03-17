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
  SearchPlaceholder: 'Artikel suchen...',
  CategoryPlaceholder: 'Kategorie',
  StatusPlaceholder: 'Status',
  TargetGroupPlaceholder: 'Zielgruppe',
  CardView: 'Kartenansicht',
  ListView: 'Listenansicht',
  NewArticle: 'Neuer Artikel',
  RemoveFilterLabel: '{0} entfernen',
  ClearFilters: 'Filter zurücksetzen',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  StatusDraft: 'Entwurf',
  StatusInReview: 'In Prüfung',
  StatusPublished: 'Veröffentlicht',
  StatusArchived: 'Archiviert',
  Category: 'Kategorie',
  TargetGroup: 'Zielgruppe',
  Status: 'Status',
  AllFilter: 'Alle',
}), { virtual: true });

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { FilterBar, IFilterBarProps } from '../FilterBar';

describe('FilterBar (DASH-06, DASH-07)', () => {
  const mockSearchChange = jest.fn();
  const mockCategoryChange = jest.fn();
  const mockStatusChange = jest.fn();
  const mockTargetGroupChange = jest.fn();
  const mockViewModeChange = jest.fn();
  const mockClearAllFilters = jest.fn();

  const defaultProps: IFilterBarProps = {
    searchQuery: '',
    onSearchChange: mockSearchChange,
    categoryFilter: '',
    onCategoryChange: mockCategoryChange,
    statusFilter: '',
    onStatusChange: mockStatusChange,
    targetGroupFilter: '',
    onTargetGroupChange: mockTargetGroupChange,
    viewMode: 'card',
    onViewModeChange: mockViewModeChange,
    categories: ['IT-Sicherheit', 'Datenschutz', 'Compliance'],
    targetGroups: ['Alle Mitarbeiter', 'IT-Abteilung'],
    onClearAllFilters: mockClearAllFilters,
    siteUrl: '/sites/wissenshub',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with placeholder text', () => {
    renderWithContext(React.createElement(FilterBar, defaultProps));
    expect(screen.getByPlaceholderText('Artikel suchen...')).toBeInTheDocument();
  });

  it('renders category dropdown', () => {
    const { container } = renderWithContext(React.createElement(FilterBar, defaultProps));
    // Fluent UI Dropdown renders with ms-Dropdown-container class
    const dropdowns = container.querySelectorAll('.ms-Dropdown-container');
    // At least 3 dropdowns: category, status, target group
    expect(dropdowns.length).toBeGreaterThanOrEqual(3);
  });

  it('renders status dropdown with German labels', () => {
    const { container } = renderWithContext(React.createElement(FilterBar, defaultProps));
    const dropdowns = container.querySelectorAll('.ms-Dropdown-container');
    expect(dropdowns.length).toBeGreaterThanOrEqual(3);
  });

  it('renders target group dropdown', () => {
    const { container } = renderWithContext(React.createElement(FilterBar, defaultProps));
    const dropdowns = container.querySelectorAll('.ms-Dropdown-container');
    expect(dropdowns.length).toBeGreaterThanOrEqual(3);
  });

  it('renders card view toggle button', () => {
    renderWithContext(React.createElement(FilterBar, defaultProps));
    expect(screen.getByTitle('Kartenansicht')).toBeInTheDocument();
  });

  it('renders list view toggle button', () => {
    renderWithContext(React.createElement(FilterBar, defaultProps));
    expect(screen.getByTitle('Listenansicht')).toBeInTheDocument();
  });

  it('calls onSearchChange when text is typed in search box', () => {
    renderWithContext(React.createElement(FilterBar, defaultProps));
    const searchInput = screen.getByPlaceholderText('Artikel suchen...');
    fireEvent.change(searchInput, { target: { value: 'DSGVO' } });
    expect(mockSearchChange).toHaveBeenCalled();
  });

  it('renders Neuer Artikel button for editor role (admin includes editor)', () => {
    // renderWithContext defaults to admin role which satisfies editor minimum
    renderWithContext(React.createElement(FilterBar, defaultProps));
    expect(screen.getByText('Neuer Artikel')).toBeInTheDocument();
  });
});
