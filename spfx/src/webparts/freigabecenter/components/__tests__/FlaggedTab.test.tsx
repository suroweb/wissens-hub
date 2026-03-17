jest.mock('FreigabecenterWebPartStrings', () => ({
  FlaggedBy: 'Gemeldet von {0} am {1}',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  OpenArticle: 'Artikel oeffnen',
}), { virtual: true });

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FlaggedTab } from '../FlaggedTab';
import { IFlag } from '../../../../shared/models/domain/IFlag';
import { IArticlePage } from '../../../../shared/models/domain/IArticlePage';

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

const MOCK_ARTICLES: IArticlePage[] = [
  {
    id: 9,
    title: 'Homeoffice-Regelung',
    category: 'Arbeitsprozesse',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2025-02-11T15:00:00Z'),
    author: { displayName: 'Lisa Fischer', email: 'lisa.fischer@contoso.de' },
    reviewerName: 'Thomas Mueller',
    reviewByDate: new Date('2025-12-01T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/Homeoffice-Regelung.aspx',
  },
];

describe('FlaggedTab', () => {
  it('renders flagged article cards', () => {
    render(
      React.createElement(FlaggedTab, {
        flags: MOCK_FLAGS,
        articles: MOCK_ARTICLES,
      })
    );
    expect(screen.getByText('Homeoffice-Regelung')).toBeInTheDocument();
  });

  it('shows flag reason for each flagged article', () => {
    render(
      React.createElement(FlaggedTab, {
        flags: MOCK_FLAGS,
        articles: MOCK_ARTICLES,
      })
    );
    expect(screen.getByText('Regelung wird derzeit ueberarbeitet')).toBeInTheDocument();
  });

  it('renders empty state when no flags', () => {
    render(
      React.createElement(FlaggedTab, {
        flags: [],
        articles: MOCK_ARTICLES,
      })
    );
    expect(screen.getByText('Keine gemeldeten Artikel')).toBeInTheDocument();
  });
});
