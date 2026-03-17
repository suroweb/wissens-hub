jest.mock('AdminPanelWebPartStrings', () => ({
  AdminPanelTitle: 'Admin-Panel',
  TabOverview: 'Uebersicht',
  TabCategories: 'Kategorien',
  TabTargetGroups: 'Zielgruppen',
  TabReports: 'Berichte',
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
  Export: 'Exportieren',
}), { virtual: true });

jest.mock('../../../../shared/context', () => ({
  useWissensHub: () => ({
    isLoading: false,
    role: 'admin',
  }),
}));

// Mock RoleGate to just render children
jest.mock('../../../../shared/components/RoleGate', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RoleGate: (props: any) =>
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    React.createElement(React.Fragment, undefined, props.children),
}));

// Mock child tabs to isolate AdminPanel tests
jest.mock('../UebersichtTab', () => ({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  UebersichtTab: () => React.createElement('div', { 'data-testid': 'uebersicht-tab' }, 'UebersichtTab'),
}));
jest.mock('../KategorienTab', () => ({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  KategorienTab: () => React.createElement('div', { 'data-testid': 'kategorien-tab' }, 'KategorienTab'),
}));
jest.mock('../ZielgruppenTab', () => ({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  ZielgruppenTab: () => React.createElement('div', { 'data-testid': 'zielgruppen-tab' }, 'ZielgruppenTab'),
}));
jest.mock('../BerichteTab', () => ({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  BerichteTab: () => React.createElement('div', { 'data-testid': 'berichte-tab' }, 'BerichteTab'),
}));

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from '../AdminPanel';

const DEFAULT_PROPS = {
  description: 'Admin Panel',
  isDarkTheme: false,
  environmentMessage: 'local',
  hasTeamsContext: false,
  userDisplayName: 'Max Mustermann',
};

describe('AdminPanel', () => {
  it('renders without crashing with admin role', () => {
    render(React.createElement(AdminPanel, DEFAULT_PROPS));
    expect(screen.getByText('Admin-Panel')).toBeInTheDocument();
  });

  it('renders Pivot with four tabs (Uebersicht, Kategorien, Zielgruppen, Berichte)', () => {
    render(React.createElement(AdminPanel, DEFAULT_PROPS));
    expect(screen.getByText('Uebersicht')).toBeInTheDocument();
    expect(screen.getByText('Kategorien')).toBeInTheDocument();
    expect(screen.getByText('Zielgruppen')).toBeInTheDocument();
    expect(screen.getByText('Berichte')).toBeInTheDocument();
  });

  it('defaults to Uebersicht tab content', () => {
    render(React.createElement(AdminPanel, DEFAULT_PROPS));
    expect(screen.getByTestId('uebersicht-tab')).toBeInTheDocument();
  });
});
