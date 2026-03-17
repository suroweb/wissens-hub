jest.mock('FreigabecenterWebPartStrings', () => ({
  ReviewerPrefix: 'Pruefer: ',
  Approve: 'Genehmigen',
  Reject: 'Ablehnen',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  NotAssigned: 'Nicht zugewiesen',
  OpenArticle: 'Artikel oeffnen',
  DaysAgo: 'vor {0} Tagen',
  JustNow: 'Gerade eben',
  SecondsAgo: 'vor {0} Sekunden',
  OneMinuteAgo: 'vor 1 Minute',
  MinutesAgo: 'vor {0} Minuten',
  OneHourAgo: 'vor 1 Stunde',
  HoursAgo: 'vor {0} Stunden',
  Yesterday: 'Gestern',
  OneMonthAgo: 'vor 1 Monat',
  MonthsAgo: 'vor {0} Monaten',
}), { virtual: true });

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PendingTab } from '../PendingTab';
import { IArticlePage } from '../../../../shared/models/domain/IArticlePage';

const MOCK_PENDING: IArticlePage[] = [
  {
    id: 7,
    title: 'Datensicherung-Konzept',
    category: 'IT-Sicherheit',
    status: 'InReview',
    isMandatory: false,
    targetGroups: ['IT-Abteilung'],
    modifiedDate: new Date('2026-03-10T13:00:00Z'),
    author: { displayName: 'Stefan Braun', email: 'stefan.braun@contoso.de' },
    reviewerName: 'Anna Schmidt',
    reviewByDate: new Date('2026-04-01T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/Datensicherung-Konzept.aspx',
  },
];

describe('PendingTab', () => {
  it('renders approval cards for pending articles', () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();
    render(
      React.createElement(PendingTab, {
        articles: MOCK_PENDING,
        onApprove: onApprove,
        onReject: onReject,
      })
    );
    expect(screen.getByText('Datensicherung-Konzept')).toBeInTheDocument();
  });

  it('shows approve and reject action buttons per article', () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();
    render(
      React.createElement(PendingTab, {
        articles: MOCK_PENDING,
        onApprove: onApprove,
        onReject: onReject,
      })
    );
    const approveBtn = screen.getByText('Genehmigen');
    const rejectBtn = screen.getByText('Ablehnen');
    expect(approveBtn).toBeInTheDocument();
    expect(rejectBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);
    expect(onApprove).toHaveBeenCalledWith(7);

    fireEvent.click(rejectBtn);
    expect(onReject).toHaveBeenCalledWith(7);
  });

  it('renders empty state when no pending articles', () => {
    render(
      React.createElement(PendingTab, {
        articles: [],
        onApprove: jest.fn(),
        onReject: jest.fn(),
      })
    );
    expect(screen.getByText('Keine ausstehenden Genehmigungen')).toBeInTheDocument();
  });
});
