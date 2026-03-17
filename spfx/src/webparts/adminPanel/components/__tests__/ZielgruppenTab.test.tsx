jest.mock('AdminPanelWebPartStrings', () => ({
  TargetGroupNamePlaceholder: 'Zielgruppen-Name',
  SharePointGroup: 'SharePoint-Gruppe',
  SelectSharePointGroup: 'SharePoint-Gruppe wahlen',
  ErrorLoadingSPGroups: 'Fehler beim Laden der SP-Gruppen',
  ErrorSavingTargetGroup: 'Fehler beim Speichern',
  ErrorCreatingTargetGroup: 'Fehler beim Erstellen',
  ErrorDeletingTargetGroup: 'Fehler beim Loeschen',
  ErrorLoadingTargetGroups: 'Fehler beim Laden der Zielgruppen',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Add: 'Hinzufuegen',
  Delete: 'Loeschen',
  Name: 'Name',
  Description: 'Beschreibung',
  Active: 'Aktiv',
  Actions: 'Aktionen',
  Save: 'Speichern',
  Cancel: 'Abbrechen',
  Edit: 'Bearbeiten',
}), { virtual: true });

const mockTargetGroupsQuery = {
  state: {
    status: 'success' as const,
    data: [
      { id: 1, name: 'Alle Mitarbeiter', sharePointGroupName: 'WissensHub Members', isActive: true },
      { id: 2, name: 'IT-Abteilung', sharePointGroupName: 'IT-Abteilung', isActive: true },
    ],
  },
  refetch: jest.fn(),
};
const mockSaveCommand = { state: { status: 'idle' as const }, execute: jest.fn().mockResolvedValue(true) };
const mockDeleteCommand = { state: { status: 'idle' as const }, execute: jest.fn().mockResolvedValue(true) };

jest.mock('../../../../shared/hooks/queries', () => ({
  useTargetGroupsQuery: () => mockTargetGroupsQuery,
}));

jest.mock('../../../../shared/hooks/commands', () => ({
  useSaveTargetGroupCommand: () => mockSaveCommand,
  useDeleteTargetGroupCommand: () => mockDeleteCommand,
}));

// Mock @pnp/sp side-effect import to avoid ESM parse error
jest.mock('@pnp/sp/site-groups/web', () => ({}), { virtual: true });

// Mock pnpSetup to avoid SP site groups call
jest.mock('../../../../shared/context/pnpSetup', () => ({
  getSP: () => ({
    web: {
      siteGroups: () => Promise.resolve([
        { Title: 'WissensHub Members' },
        { Title: 'IT-Abteilung' },
      ]),
    },
  }),
}));

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ZielgruppenTab } from '../ZielgruppenTab';

describe('ZielgruppenTab', () => {
  it('renders target group list', () => {
    render(React.createElement(ZielgruppenTab));
    expect(screen.getByText('Alle Mitarbeiter')).toBeInTheDocument();
    // IT-Abteilung appears twice (name + SP group), use getAllByText
    const matches = screen.getAllByText('IT-Abteilung');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows SharePoint group name mapping', () => {
    render(React.createElement(ZielgruppenTab));
    expect(screen.getByText('WissensHub Members')).toBeInTheDocument();
  });

  it('renders add target group button', () => {
    render(React.createElement(ZielgruppenTab));
    expect(screen.getByText('Hinzufugen')).toBeInTheDocument();
  });

  it('renders Name column header', () => {
    render(React.createElement(ZielgruppenTab));
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
