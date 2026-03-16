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
    url: '/sites/wissenshub/SitePages/Passwort-Richtlinie.aspx',
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
    url: '/sites/wissenshub/SitePages/DSGVO-Grundlagen.aspx',
  },
  {
    id: 3,
    title: 'VPN-Zugang einrichten',
    category: 'IT-Sicherheit',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['IT-Abteilung'],
    modifiedDate: new Date('2026-01-20T14:15:00Z'),
    author: { displayName: 'Stefan Braun', email: 'stefan.braun@contoso.de' },
    url: '/sites/wissenshub/SitePages/VPN-Zugang-einrichten.aspx',
  },
  {
    id: 4,
    title: 'Onboarding-Checkliste',
    category: 'Onboarding',
    status: 'Published',
    isMandatory: true,
    targetGroups: ['Neue Mitarbeiter'],
    modifiedDate: new Date('2026-02-10T08:00:00Z'),
    author: { displayName: 'Lisa Fischer', email: 'lisa.fischer@contoso.de' },
    reviewerName: 'Thomas Mueller',
    reviewByDate: new Date('2026-07-10T00:00:00Z'),
    url: '/sites/wissenshub/SitePages/Onboarding-Checkliste.aspx',
  },
  {
    id: 5,
    title: 'Reisekostenabrechnung',
    category: 'Arbeitsprozesse',
    status: 'Draft',
    isMandatory: false,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-03-01T11:45:00Z'),
    author: { displayName: 'Maria Hoffmann', email: 'maria.hoffmann@contoso.de' },
    url: '/sites/wissenshub/SitePages/Reisekostenabrechnung.aspx',
  },
  {
    id: 6,
    title: 'IT-Notfallplan',
    category: 'IT-Sicherheit',
    status: 'Draft',
    isMandatory: false,
    targetGroups: ['IT-Abteilung'],
    modifiedDate: new Date('2026-03-05T16:30:00Z'),
    author: { displayName: 'Stefan Braun', email: 'stefan.braun@contoso.de' },
    url: '/sites/wissenshub/SitePages/IT-Notfallplan.aspx',
  },
  {
    id: 7,
    title: 'Compliance-Schulung 2026',
    category: 'Compliance',
    status: 'InReview',
    isMandatory: true,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-03-10T13:00:00Z'),
    author: { displayName: 'Klaus Weber', email: 'klaus.weber@contoso.de' },
    reviewerName: 'Anna Schmidt',
    reviewByDate: new Date('2026-04-01T00:00:00Z'),
    url: '/sites/wissenshub/SitePages/Compliance-Schulung-2026.aspx',
  },
  {
    id: 8,
    title: 'Archivierungsrichtlinie',
    category: 'Arbeitsprozesse',
    status: 'Archived',
    isMandatory: false,
    targetGroups: ['Management'],
    modifiedDate: new Date('2025-11-20T09:00:00Z'),
    author: { displayName: 'Maria Hoffmann', email: 'maria.hoffmann@contoso.de' },
    url: '/sites/wissenshub/SitePages/Archivierungsrichtlinie.aspx',
  },
  {
    id: 9,
    title: 'Datenschutz-Folgenabschaetzung',
    category: 'Datenschutz',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['Management'],
    modifiedDate: new Date('2026-02-20T15:00:00Z'),
    author: { displayName: 'Thomas Mueller', email: 'thomas.mueller@contoso.de' },
    reviewerName: 'Klaus Weber',
    reviewByDate: new Date('2026-09-01T00:00:00Z'),
    url: '/sites/wissenshub/SitePages/Datenschutz-Folgenabschaetzung.aspx',
  },
  {
    id: 10,
    title: 'Home-Office-Regelung',
    category: 'Arbeitsprozesse',
    status: 'Published',
    isMandatory: false,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-02-28T10:30:00Z'),
    author: { displayName: 'Lisa Fischer', email: 'lisa.fischer@contoso.de' },
    url: '/sites/wissenshub/SitePages/Home-Office-Regelung.aspx',
  },
];

export const MOCK_READ_CONFIRMATIONS: IReadConfirmation[] = [
  {
    pageId: 1,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    readDate: new Date('2026-01-20T10:30:00Z'),
  },
  {
    pageId: 2,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    readDate: new Date('2026-02-05T14:00:00Z'),
  },
  {
    pageId: 3,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    readDate: new Date('2026-01-25T09:15:00Z'),
  },
  {
    pageId: 4,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    readDate: new Date('2026-02-12T11:00:00Z'),
  },
  {
    pageId: 10,
    userId: 'mock-user-id',
    userDisplayName: 'Max Mustermann',
    readDate: new Date('2026-03-01T08:45:00Z'),
  },
];

export const MOCK_FAVORITES: IFavorite[] = [
  {
    pageId: 1,
    userId: 'mock-user-id',
    favoritedDate: new Date('2026-01-22T10:00:00Z'),
  },
  {
    pageId: 3,
    userId: 'mock-user-id',
    favoritedDate: new Date('2026-01-26T14:30:00Z'),
  },
  {
    pageId: 10,
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
    reason: 'Veraltete Informationen zur Folgenabschaetzung',
    flaggedDate: new Date('2026-03-10T16:00:00Z'),
  },
];
