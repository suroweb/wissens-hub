jest.mock('@pnp/sp', () => ({ spfi: jest.fn(), SPFx: jest.fn() }));
jest.mock('@pnp/queryable', () => ({ Caching: jest.fn() }));
jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));
jest.mock('@pnp/sp/site-users/web', () => ({}));
jest.mock('@pnp/sp/site-groups/web', () => ({}));
jest.mock('@microsoft/sp-http', () => ({}));
jest.mock('../../../../shared/context/pnpSetup', () => ({ getSP: jest.fn() }));

jest.mock('ArticleSidebarWebPartStrings', () => ({
  MandatoryReadRequired: 'Pflichtartikel - Lesebestaetigung erforderlich',
  ArticleUpdatedReconfirm: 'Artikel wurde aktualisiert. ',
  PreviouslyReadOn: 'Zuvor gelesen am {0}',
  ReconfirmReading: 'Erneut bestaetigen',
  ReadOn: 'Gelesen am {0}',
  ReportedOn: 'Gemeldet am {0}',
  ReportAsOutdated: 'Als veraltet melden',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  MarkAsRead: 'Als gelesen markieren',
  RemoveFavorite: 'Favorit entfernen',
  AddFavorite: 'Als Favorit markieren',
}), { virtual: true });

const mockMarkAsRead = jest.fn().mockResolvedValue(true);
const mockToggleFavorite = jest.fn().mockResolvedValue(true);

jest.mock('../../../../shared/hooks/commands', () => ({
  useMarkAsReadCommand: () => ({
    state: { status: 'idle' },
    execute: mockMarkAsRead,
  }),
  useToggleFavoriteCommand: () => ({
    state: { status: 'idle' },
    execute: mockToggleFavorite,
  }),
}));

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { ReadStatusSection, IReadStatusSectionProps } from '../ReadStatusSection';

describe('ReadStatusSection (SIDE-02, SIDE-03, SIDE-05, READ-01, READ-02)', () => {
  const onFlagClick = jest.fn();
  const onReadStatusChange = jest.fn();

  const defaultProps: IReadStatusSectionProps = {
    pageId: 1,
    isMandatory: false,
    readConfirmation: undefined,
    contentVersion: 1,
    isFavorited: false,
    userFlagDate: undefined,
    onFlagClick: onFlagClick,
    onReadStatusChange: onReadStatusChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows mark-as-read button when unread', () => {
    renderWithContext(React.createElement(ReadStatusSection, defaultProps));
    expect(screen.getByText('Als gelesen markieren')).toBeInTheDocument();
  });

  it('shows read confirmation date after marking as read', () => {
    const props: IReadStatusSectionProps = {
      ...defaultProps,
      readConfirmation: {
        pageId: 1,
        userId: 'mock-user-id',
        userDisplayName: 'Max Mustermann',
        readDate: new Date('2026-02-15T10:00:00Z'),
        confirmedVersion: 1,
      },
    };
    renderWithContext(React.createElement(ReadStatusSection, props));
    expect(screen.getByText('Gelesen am 15.02.2026')).toBeInTheDocument();
  });

  it('shows Pflichtartikel badge for mandatory unread articles', () => {
    const props: IReadStatusSectionProps = {
      ...defaultProps,
      isMandatory: true,
    };
    renderWithContext(React.createElement(ReadStatusSection, props));
    // MessageBar with severeWarning type (Pflichtartikel badge) should be present
    const badge = document.querySelector('.ms-MessageBar--severeWarning');
    expect(badge).toBeTruthy();
  });

  it('does not show Pflichtartikel badge for mandatory read articles', () => {
    const props: IReadStatusSectionProps = {
      ...defaultProps,
      isMandatory: true,
      readConfirmation: {
        pageId: 1,
        userId: 'mock-user-id',
        userDisplayName: 'Max Mustermann',
        readDate: new Date('2026-02-15T10:00:00Z'),
        confirmedVersion: 1,
      },
    };
    renderWithContext(React.createElement(ReadStatusSection, props));
    const badge = document.querySelector('.ms-MessageBar--severeWarning');
    expect(badge).toBeFalsy();
  });

  it('shows version reset warning when contentVersion > confirmedVersion', () => {
    const props: IReadStatusSectionProps = {
      ...defaultProps,
      readConfirmation: {
        pageId: 1,
        userId: 'mock-user-id',
        userDisplayName: 'Max Mustermann',
        readDate: new Date('2026-02-15T10:00:00Z'),
        confirmedVersion: 1,
      },
      contentVersion: 2,
    };
    renderWithContext(React.createElement(ReadStatusSection, props));
    // Reconfirm button should appear (text in PrimaryButton)
    expect(screen.getByText('Erneut bestaetigen')).toBeInTheDocument();
    // Warning MessageBar should be rendered
    const warningBar = document.querySelector('.ms-MessageBar--warning');
    expect(warningBar).toBeTruthy();
  });

  it('shows reconfirm button instead of read date in reset warning', () => {
    const props: IReadStatusSectionProps = {
      ...defaultProps,
      readConfirmation: {
        pageId: 1,
        userId: 'mock-user-id',
        userDisplayName: 'Max Mustermann',
        readDate: new Date('2026-02-15T10:00:00Z'),
        confirmedVersion: 1,
      },
      contentVersion: 2,
    };
    renderWithContext(React.createElement(ReadStatusSection, props));
    // When reconfirmation is needed, the reconfirm button appears
    // and the previous read confirmation is shown with strikethrough
    expect(screen.getByText('Erneut bestaetigen')).toBeInTheDocument();
    // Warning MessageBar should be present
    const warningBar = document.querySelector('.ms-MessageBar--warning');
    expect(warningBar).toBeTruthy();
    // The regular read date should NOT be shown (isEffectivelyUnread = true)
    expect(screen.queryByText('Gelesen am 15.02.2026')).toBeNull();
  });

  it('calls onMarkAsRead when mark-as-read button is clicked', () => {
    renderWithContext(React.createElement(ReadStatusSection, defaultProps));
    const button = screen.getByText('Als gelesen markieren');
    fireEvent.click(button);
    expect(mockMarkAsRead).toHaveBeenCalledWith(1);
  });

  it('shows "Als veraltet melden" button when not flagged', () => {
    renderWithContext(React.createElement(ReadStatusSection, defaultProps));
    expect(screen.getByText('Als veraltet melden')).toBeInTheDocument();
  });

  it('shows disabled "Gemeldet am [date]" when already flagged', () => {
    const props: IReadStatusSectionProps = {
      ...defaultProps,
      userFlagDate: new Date('2026-03-10T16:00:00Z'),
    };
    renderWithContext(React.createElement(ReadStatusSection, props));
    expect(screen.getByText('Gemeldet am 10.03.2026')).toBeInTheDocument();
  });

  it('toggles favorite star between filled and outline', () => {
    // Unfavorited
    const { unmount } = renderWithContext(
      React.createElement(ReadStatusSection, defaultProps)
    );
    expect(screen.getByTitle('Als Favorit markieren')).toBeInTheDocument();
    unmount();

    // Favorited
    const favoritedProps: IReadStatusSectionProps = {
      ...defaultProps,
      isFavorited: true,
    };
    renderWithContext(React.createElement(ReadStatusSection, favoritedProps));
    expect(screen.getByTitle('Favorit entfernen')).toBeInTheDocument();
  });

  it('calls onFlagClick when flag button is clicked', () => {
    renderWithContext(React.createElement(ReadStatusSection, defaultProps));
    fireEvent.click(screen.getByText('Als veraltet melden'));
    expect(onFlagClick).toHaveBeenCalledTimes(1);
  });
});
