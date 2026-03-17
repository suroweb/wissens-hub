jest.mock('AdminPanelWebPartStrings', () => ({
  StatusFilter: 'Status-Filter',
  StatsTotal: 'Gesamt',
  StatsFlagged: 'Gemeldet',
  Freshness: 'Aktualitat',
  FreshnessGreen: 'Aktuell',
  FreshnessYellow: 'Veraltet',
  FreshnessRed: 'Kritisch',
  Flags: 'Meldungen',
  ReminderIntervalTitle: 'Erinnerungs-Intervall',
  ReminderIntervalHelp: 'Intervall-Hilfe',
  IntervalSaved: 'Intervall gespeichert.',
  ErrorSavingInterval: 'Fehler beim Speichern',
  ErrorLoadingOverview: 'Fehler beim Laden',
  DaysUnit: 'Tage',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Add: 'Hinzufuegen',
  Name: 'Name',
  Active: 'Aktiv',
}), { virtual: true });

const MOCK_ARTICLES = [
  {
    pageId: 1,
    title: 'Passwort-Richtlinie',
    status: 'Published',
    category: 'IT-Sicherheit',
    readCount: 15,
    targetUserCount: 25,
    flagCount: 0,
    lastUpdated: new Date('2025-11-17T10:00:00Z'),
  },
  {
    pageId: 2,
    title: 'DSGVO-Grundlagen',
    status: 'Published',
    category: 'Datenschutz',
    readCount: 20,
    targetUserCount: 25,
    flagCount: 1,
    lastUpdated: new Date('2026-02-01T09:30:00Z'),
  },
];

const MOCK_REPORT = {
  articles: MOCK_ARTICLES,
  totalArticles: 10,
  publishedCount: 5,
  draftCount: 2,
  inReviewCount: 1,
  flaggedCount: 1,
};

const mockReportsQuery = {
  state: { status: 'success' as const, data: MOCK_REPORT },
  refetch: jest.fn(),
};

const mockReminderQuery = {
  state: { status: 'success' as const, data: 30 },
  refetch: jest.fn(),
};

const mockReminderCommand = {
  state: { status: 'idle' as const },
  execute: jest.fn().mockResolvedValue(true),
};

jest.mock('../../../../shared/hooks/queries', () => ({
  useAdminReportsQuery: () => mockReportsQuery,
  useReminderConfigQuery: () => mockReminderQuery,
}));

jest.mock('../../../../shared/hooks/commands', () => ({
  useUpdateReminderConfigCommand: () => mockReminderCommand,
}));

// Mock StatsCards to render stats as testable text
jest.mock('../StatsCards', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define
  StatsCards: (props: any) => React.createElement('div', { 'data-testid': 'stats-cards' },
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    React.createElement('span', { 'data-testid': 'total' }, 'Gesamt: ' + props.totalArticles),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    React.createElement('span', { 'data-testid': 'flagged' }, 'Gemeldet: ' + props.flaggedCount),
  ),
}));

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UebersichtTab } from '../UebersichtTab';

describe('UebersichtTab', () => {
  it('renders StatsCards with article status counts', () => {
    render(React.createElement(UebersichtTab));
    expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
  });

  it('shows total article count', () => {
    render(React.createElement(UebersichtTab));
    expect(screen.getByText('Gesamt: 10')).toBeInTheDocument();
  });

  it('shows flagged article count', () => {
    render(React.createElement(UebersichtTab));
    expect(screen.getByText('Gemeldet: 1')).toBeInTheDocument();
  });

  it('renders article table with column headers', () => {
    render(React.createElement(UebersichtTab));
    expect(screen.getByText('Titel')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Kategorie')).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    render(React.createElement(UebersichtTab));
    expect(screen.getByText('Status-Filter')).toBeInTheDocument();
  });
});
