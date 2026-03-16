import { IArticlePage } from '../../models/domain/IArticlePage';
import { IReadConfirmation } from '../../models/domain/IReadConfirmation';
import { IFavorite } from '../../models/domain/IFavorite';
import { IFlag } from '../../models/domain/IFlag';
import { ICurrentUser } from '../../models/domain/IUser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_DELAY: number = typeof process !== 'undefined' && (process as any).env?.NODE_ENV === 'test' ? 0 : 300;

export function delay<T>(value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), MOCK_DELAY));
}

export const MOCK_CATEGORIES: string[] = [
  'IT-Sicherheit', 'Datenschutz', 'Onboarding', 'Arbeitsprozesse', 'Compliance'
];

export const MOCK_TARGET_GROUPS: string[] = [
  'Alle Mitarbeiter', 'IT-Abteilung', 'Management', 'Neue Mitarbeiter'
];

export const MOCK_CURRENT_USER: ICurrentUser = {
  displayName: 'Max Mustermann',
  email: 'max.mustermann@contoso.de',
  loginName: 'i:0#.f|membership|max.mustermann@contoso.de',
};

export const MOCK_ARTICLES: IArticlePage[] = [
  {
    id: 1,
    title: 'Passwort-Richtlinie',
    category: 'IT-Sicherheit',
    status: 'Published',
    isMandatory: true,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-01-15T10:00:00Z'),
    author: { displayName: 'Anna Schmidt', email: 'anna.schmidt@contoso.de' },
    reviewerName: 'Klaus Weber',
    reviewByDate: new Date('2026-06-15T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/Passwort-Richtlinie.aspx',
  },
  {
    id: 2,
    title: 'DSGVO-Grundlagen',
    category: 'Datenschutz',
    status: 'Published',
    isMandatory: true,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-02-01T09:30:00Z'),
    author: { displayName: 'Thomas Mueller', email: 'thomas.mueller@contoso.de' },
    reviewerName: 'Anna Schmidt',
    reviewByDate: new Date('2026-08-01T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/DSGVO-Grundlagen.aspx',
  },
  {
    id: 3,
    title: 'Onboarding-Leitfaden',
    category: 'Onboarding',
    status: 'Published',
    isMandatory: true,
    targetGroups: ['Neue Mitarbeiter'],
    modifiedDate: new Date('2026-02-10T08:00:00Z'),
    author: { displayName: 'Lisa Fischer', email: 'lisa.fischer@contoso.de' },
    reviewerName: 'Thomas Mueller',
    reviewByDate: new Date('2026-07-10T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/Onboarding-Leitfaden.aspx',
  },
  {
    id: 4,
    title: 'VPN-Zugang einrichten',
    category: 'IT-Sicherheit',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['IT-Abteilung'],
    modifiedDate: new Date('2026-01-20T14:15:00Z'),
    author: { displayName: 'Stefan Braun', email: 'stefan.braun@contoso.de' },
    url: '/sites/WissensHub/SitePages/VPN-Zugang-einrichten.aspx',
  },
  {
    id: 5,
    title: 'Reisekostenabrechnung',
    category: 'Arbeitsprozesse',
    status: 'Draft',
    isMandatory: false,
    targetGroups: ['Management'],
    modifiedDate: new Date('2026-03-01T11:45:00Z'),
    author: { displayName: 'Maria Hoffmann', email: 'maria.hoffmann@contoso.de' },
    url: '/sites/WissensHub/SitePages/Reisekostenabrechnung.aspx',
  },
  {
    id: 6,
    title: 'Compliance-Schulung 2026',
    category: 'Compliance',
    status: 'Draft',
    isMandatory: true,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-03-05T16:30:00Z'),
    author: { displayName: 'Klaus Weber', email: 'klaus.weber@contoso.de' },
    url: '/sites/WissensHub/SitePages/Compliance-Schulung-2026.aspx',
  },
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
  {
    id: 8,
    title: 'Altdaten-Archivierung',
    category: 'Datenschutz',
    status: 'Archived',
    isMandatory: false,
    targetGroups: ['Management'],
    modifiedDate: new Date('2025-11-20T09:00:00Z'),
    author: { displayName: 'Maria Hoffmann', email: 'maria.hoffmann@contoso.de' },
    url: '/sites/WissensHub/SitePages/Altdaten-Archivierung.aspx',
  },
  {
    id: 9,
    title: 'Homeoffice-Regelung',
    category: 'Arbeitsprozesse',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-02-20T15:00:00Z'),
    author: { displayName: 'Lisa Fischer', email: 'lisa.fischer@contoso.de' },
    url: '/sites/WissensHub/SitePages/Homeoffice-Regelung.aspx',
  },
  {
    id: 10,
    title: 'IT-Sicherheitsvorfall-Meldung',
    category: 'IT-Sicherheit',
    status: 'Published',
    isMandatory: true,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-02-28T10:30:00Z'),
    author: { displayName: 'Thomas Mueller', email: 'thomas.mueller@contoso.de' },
    reviewerName: 'Klaus Weber',
    reviewByDate: new Date('2026-09-01T00:00:00Z'),
    url: '/sites/WissensHub/SitePages/IT-Sicherheitsvorfall-Meldung.aspx',
  },
];

// Empty by default so all articles start as unread in the dashboard.
// The user marks articles as read via markAsRead() which appends entries at runtime.
export const MOCK_READ_CONFIRMATIONS: IReadConfirmation[] = [];

export const MOCK_FAVORITES: IFavorite[] = [
  {
    pageId: 1,
    userId: 'mock-user-id',
    favoritedDate: new Date('2026-01-22T10:00:00Z'),
  },
  {
    pageId: 4,
    userId: 'mock-user-id',
    favoritedDate: new Date('2026-01-26T14:30:00Z'),
  },
  {
    pageId: 9,
    userId: 'mock-user-id',
    favoritedDate: new Date('2026-03-02T09:00:00Z'),
  },
];

export const MOCK_FLAGS: IFlag[] = [
  {
    id: 1,
    pageId: 9,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    reason: 'Regelung wird derzeit \u00fcberarbeitet, neue Version Q2 2026 erwartet',
    flaggedDate: new Date('2026-03-10T16:00:00Z'),
  },
];
