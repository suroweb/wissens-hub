jest.mock('AdminPanelWebPartStrings', () => ({
  ReadQuota: 'Lesequote',
  ErrorLoadingReports: 'Fehler beim Laden der Berichte',
  BackToOverview: 'Zurueck zur Uebersicht',
  ReadDate: 'Lesedatum',
  UsersHaveRead: 'Benutzer haben gelesen',
  ErrorLoadingReadDetails: 'Fehler beim Laden',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Export: 'Exportieren',
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

const mockReportsQuery = {
  state: {
    status: 'success' as const,
    data: {
      articles: MOCK_ARTICLES,
      totalArticles: 10,
      publishedCount: 5,
      draftCount: 2,
      inReviewCount: 1,
      flaggedCount: 1,
    },
  },
  refetch: jest.fn(),
};

jest.mock('../../../../shared/hooks/queries', () => ({
  useAdminReportsQuery: () => mockReportsQuery,
}));

// Mock exportUtils
jest.mock('../../../../shared/utils/exportUtils', () => ({
  exportToCsv: jest.fn(),
  exportToExcel: jest.fn().mockResolvedValue(undefined),
}));

// Mock ReadReportDrilldown
jest.mock('../ReadReportDrilldown', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define
  ReadReportDrilldown: (props: any) => React.createElement('div', { 'data-testid': 'drilldown' }, 'Drilldown for ' + props.pageId),
}));

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BerichteTab } from '../BerichteTab';

describe('BerichteTab', () => {
  it('renders article list with titles', () => {
    render(React.createElement(BerichteTab));
    expect(screen.getByText('Passwort-Richtlinie')).toBeInTheDocument();
    expect(screen.getByText('DSGVO-Grundlagen')).toBeInTheDocument();
  });

  it('renders report table with status and category columns', () => {
    render(React.createElement(BerichteTab));
    expect(screen.getByText('Titel')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Kategorie')).toBeInTheDocument();
  });

  it('renders read quota column with progress', () => {
    render(React.createElement(BerichteTab));
    expect(screen.getByText('Lesequote')).toBeInTheDocument();
    // Progress indicators show "readCount / targetUserCount"
    expect(screen.getByText('15 / 25')).toBeInTheDocument();
    expect(screen.getByText('20 / 25')).toBeInTheDocument();
  });

  it('renders export button', () => {
    render(React.createElement(BerichteTab));
    expect(screen.getByText('Exportieren')).toBeInTheDocument();
  });

  it('renders flag count column', () => {
    render(React.createElement(BerichteTab));
    expect(screen.getByText('Meldungen')).toBeInTheDocument();
  });
});
