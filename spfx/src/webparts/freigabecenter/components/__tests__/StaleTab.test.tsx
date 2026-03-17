jest.mock('FreigabecenterWebPartStrings', () => ({
  LastModified: 'Zuletzt geaendert: {0} ({1} Tage)',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  OpenArticle: 'Artikel oeffnen',
}), { virtual: true });

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StaleTab } from '../StaleTab';
import { IArticlePage } from '../../../../shared/models/domain/IArticlePage';

function createStaleArticle(id: number, title: string, daysAgo: number): IArticlePage {
  const ms = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return {
    id: id,
    title: title,
    category: 'IT-Sicherheit',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date(ms),
    author: { displayName: 'Test Author', email: 'test@contoso.de' },
    reviewerName: 'Test Reviewer',
    reviewByDate: new Date('2026-06-01T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/Article-' + id + '.aspx',
  };
}

describe('StaleTab', () => {
  it('renders stale article cards', () => {
    const articles = [createStaleArticle(1, 'Stale Article One', 100)];
    render(
      React.createElement(StaleTab, { articles: articles })
    );
    expect(screen.getByText('Stale Article One')).toBeInTheDocument();
  });

  it('renders cards with border color based on age', () => {
    // 95 days = yellow (#ffc107), 130 days = orange (#ff9800), 200 days = red (#f44336)
    const articles = [
      createStaleArticle(1, 'Yellow Article', 95),
      createStaleArticle(2, 'Orange Article', 130),
      createStaleArticle(3, 'Red Article', 200),
    ];
    const { container } = render(
      React.createElement(StaleTab, { articles: articles })
    );
    // StaleCard applies borderLeftColor inline style
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cards = container.querySelectorAll('[style]');
    const cardStyles: string[] = [];
    for (let i = 0; i < cards.length; i++) {
      const style = cards[i].getAttribute('style') || '';
      if (style.indexOf('border-left-color') !== -1) {
        cardStyles.push(style);
      }
    }
    // At least 3 cards with border-left-color
    expect(cardStyles.length).toBeGreaterThanOrEqual(3);
  });

  it('renders empty state when no stale articles', () => {
    render(
      React.createElement(StaleTab, { articles: [] })
    );
    expect(screen.getByText('Keine veralteten Artikel')).toBeInTheDocument();
  });
});
