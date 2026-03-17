// Mock loc modules
jest.mock('UnreadBadgeApplicationCustomizerStrings', () => ({
  Title: 'UnreadBadgeApplicationCustomizer',
  UnreadArticlesAriaLabel: 'Ungelesene Artikel: {0}',
  UnreadArticlesHeader: '{0} ungelesene Artikel',
  LoadingUnreadArticles: 'Lade ungelesene Artikel...',
  AllArticlesRead: 'Alle Artikel gelesen!',
  ShowAll: 'Alle {0} anzeigen',
  ClosePanel: 'Schliessen',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  MandatoryArticle: 'Pflichtartikel',
}), { virtual: true });

// Mock the UnreadFlyoutPanel to isolate header tests
jest.mock('../UnreadFlyoutPanel', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UnreadFlyoutPanel: (props: any) => (
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    React.createElement('div', { 'data-testid': 'flyout-panel', 'data-is-open': String(props.isOpen) })
  ),
}));

import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnreadBadgeHeader } from '../UnreadBadgeHeader';
import { IUnreadArticle } from '../../models/IUnreadArticle';

function createMockArticles(count: number): IUnreadArticle[] {
  const articles: IUnreadArticle[] = [];
  for (let i = 1; i <= count; i++) {
    articles.push({
      pageId: i,
      title: 'Article ' + i,
      category: 'IT-Sicherheit',
      isMandatory: false,
      updatedAt: new Date('2026-03-01T10:00:00Z'),
      url: '/sites/WissensHub/SitePages/Article-' + i + '.aspx',
    });
  }
  return articles;
}

describe('UnreadBadgeHeader (BADGE-01)', () => {
  it('renders bell icon', () => {
    const articles = createMockArticles(3);
    render(
      <UnreadBadgeHeader
        articles={articles}
        isLoading={false}
        error={undefined}
        siteUrl="https://contoso.sharepoint.com/sites/WissensHub"
      />
    );
    const button = screen.getByLabelText(/Ungelesene Artikel/);
    expect(button).toBeInTheDocument();
  });

  it('shows badge with count when articles exist', () => {
    const articles = createMockArticles(3);
    render(
      <UnreadBadgeHeader
        articles={articles}
        isLoading={false}
        error={undefined}
        siteUrl="https://contoso.sharepoint.com/sites/WissensHub"
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides badge when count is zero', () => {
    render(
      <UnreadBadgeHeader
        articles={[]}
        isLoading={false}
        error={undefined}
        siteUrl="https://contoso.sharepoint.com/sites/WissensHub"
      />
    );
    const button = screen.getByLabelText('Ungelesene Artikel: 0');
    expect(button).toBeInTheDocument();
    // Badge span should not be present
    expect(screen.queryByText('0')).toBeNull();
  });

  it('caps count at 99+', () => {
    const articles = createMockArticles(100);
    render(
      <UnreadBadgeHeader
        articles={articles}
        isLoading={false}
        error={undefined}
        siteUrl="https://contoso.sharepoint.com/sites/WissensHub"
      />
    );
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('toggles panel on bell click', () => {
    const articles = createMockArticles(3);
    render(
      <UnreadBadgeHeader
        articles={articles}
        isLoading={false}
        error={undefined}
        siteUrl="https://contoso.sharepoint.com/sites/WissensHub"
      />
    );
    const panel = screen.getByTestId('flyout-panel');
    expect(panel.getAttribute('data-is-open')).toBe('false');

    const button = screen.getByLabelText(/Ungelesene Artikel/);
    fireEvent.click(button);
    expect(screen.getByTestId('flyout-panel').getAttribute('data-is-open')).toBe('true');
  });

  it('decrements count on CustomEvent', () => {
    const articles = createMockArticles(3);
    render(
      <UnreadBadgeHeader
        articles={articles}
        isLoading={false}
        error={undefined}
        siteUrl="https://contoso.sharepoint.com/sites/WissensHub"
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(
        new CustomEvent('wissenshub:article-read', {
          detail: { pageId: 1 },
        })
      );
    });

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
