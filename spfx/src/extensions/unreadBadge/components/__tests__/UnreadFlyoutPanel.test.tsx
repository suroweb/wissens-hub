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

// Mock shared utilities before imports
jest.mock('../../../../shared/utils/getCategoryColor', () => ({
  getCategoryColor: () => '#0078d4',
}));

jest.mock('../../../../shared/utils/formatRelativeDate', () => ({
  formatRelativeDate: () => 'vor 2 Tagen',
}));

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnreadFlyoutPanel } from '../UnreadFlyoutPanel';
import { IUnreadArticle } from '../../models/IUnreadArticle';

const DEFAULT_PROPS = {
  isOpen: true,
  totalCount: 0,
  isLoading: false,
  error: undefined,
  siteUrl: 'https://contoso.sharepoint.com/sites/WissensHub',
  onDismiss: jest.fn(),
  onArticleClick: jest.fn(),
};

function createArticle(overrides: Partial<IUnreadArticle> & { pageId: number }): IUnreadArticle {
  return {
    title: 'Article ' + overrides.pageId,
    category: 'IT-Sicherheit',
    isMandatory: false,
    updatedAt: new Date('2026-03-01T10:00:00Z'),
    url: '/sites/WissensHub/SitePages/Article-' + overrides.pageId + '.aspx',
    ...overrides,
  };
}

describe('UnreadFlyoutPanel (BADGE-02, BADGE-03)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no articles', () => {
    render(
      <UnreadFlyoutPanel {...DEFAULT_PROPS} articles={[]} totalCount={0} />
    );
    expect(screen.getByText('Alle Artikel gelesen!')).toBeInTheDocument();
  });

  it('renders article items', () => {
    const articles = [
      createArticle({ pageId: 1, title: 'Passwort-Richtlinie' }),
      createArticle({ pageId: 2, title: 'DSGVO-Grundlagen' }),
    ];
    render(
      <UnreadFlyoutPanel {...DEFAULT_PROPS} articles={articles} totalCount={2} />
    );
    expect(screen.getByText('Passwort-Richtlinie')).toBeInTheDocument();
    expect(screen.getByText('DSGVO-Grundlagen')).toBeInTheDocument();
  });

  it('sorts mandatory articles to top', () => {
    const articles = [
      createArticle({ pageId: 1, title: 'Non-Mandatory', isMandatory: false }),
      createArticle({ pageId: 2, title: 'Mandatory-Article', isMandatory: true }),
    ];
    render(
      <UnreadFlyoutPanel {...DEFAULT_PROPS} articles={articles} totalCount={2} />
    );
    // Get all article titles by their role buttons
    const items = screen.getAllByRole('button');
    // The mandatory article (pageId 2) should appear before non-mandatory (pageId 1)
    const itemTexts = items.map(item => item.textContent || '');
    const mandatoryIdx = itemTexts.findIndex(text => text.indexOf('Mandatory-Article') >= 0);
    const nonMandatoryIdx = itemTexts.findIndex(text => text.indexOf('Non-Mandatory') >= 0);
    expect(mandatoryIdx).toBeLessThan(nonMandatoryIdx);
  });

  it('shows Pflichtartikel badge for mandatory articles', () => {
    const articles = [
      createArticle({ pageId: 1, title: 'Mandatory', isMandatory: true }),
    ];
    render(
      <UnreadFlyoutPanel {...DEFAULT_PROPS} articles={articles} totalCount={1} />
    );
    expect(screen.getByText('Pflichtartikel')).toBeInTheDocument();
  });

  it('calls onArticleClick on article click', () => {
    const onArticleClick = jest.fn();
    const articles = [
      createArticle({ pageId: 1, title: 'Test-Article', url: '/sites/WissensHub/SitePages/Test.aspx' }),
    ];
    render(
      <UnreadFlyoutPanel
        {...DEFAULT_PROPS}
        articles={articles}
        totalCount={1}
        onArticleClick={onArticleClick}
      />
    );
    fireEvent.click(screen.getByText('Test-Article'));
    expect(onArticleClick).toHaveBeenCalledWith('/sites/WissensHub/SitePages/Test.aspx');
  });

  it('shows "Alle N anzeigen" link when totalCount > 10', () => {
    const articles: IUnreadArticle[] = [];
    for (let i = 1; i <= 5; i++) {
      articles.push(createArticle({ pageId: i }));
    }
    render(
      <UnreadFlyoutPanel {...DEFAULT_PROPS} articles={articles} totalCount={15} />
    );
    expect(screen.getByText('Alle 15 anzeigen')).toBeInTheDocument();
  });

  it('does not show "Alle N anzeigen" link when totalCount <= 10', () => {
    const articles = [
      createArticle({ pageId: 1 }),
    ];
    render(
      <UnreadFlyoutPanel {...DEFAULT_PROPS} articles={articles} totalCount={5} />
    );
    expect(screen.queryByText(/Alle \d+ anzeigen/)).toBeNull();
  });
});
