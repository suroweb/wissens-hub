jest.mock('AdminPanelWebPartStrings', () => ({
  CategoryNamePlaceholder: 'Kategoriename',
  DescriptionPlaceholder: 'Beschreibung',
  ErrorSavingCategory: 'Fehler beim Speichern',
  ErrorUpdatingCategoryStatus: 'Fehler beim Aktualisieren',
  ErrorCreatingCategory: 'Fehler beim Erstellen',
  ErrorDeletingCategory: 'Fehler beim Loeschen',
  ErrorLoadingCategories: 'Fehler beim Laden der Kategorien',
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

const mockCategoriesQuery = {
  state: {
    status: 'success' as const,
    data: [
      { id: 1, name: 'IT-Sicherheit', description: 'IT-Sicherheitsrichtlinien', isActive: true },
      { id: 2, name: 'Datenschutz', description: 'Datenschutzrichtlinien', isActive: true },
    ],
  },
  refetch: jest.fn(),
};
const mockSaveCommand = { state: { status: 'idle' as const }, execute: jest.fn().mockResolvedValue(true) };
const mockDeleteCommand = { state: { status: 'idle' as const }, execute: jest.fn().mockResolvedValue(true) };

jest.mock('../../../../shared/hooks/queries', () => ({
  useCategoriesQuery: () => mockCategoriesQuery,
}));

jest.mock('../../../../shared/hooks/commands', () => ({
  useSaveCategoryCommand: () => mockSaveCommand,
  useDeleteCategoryCommand: () => mockDeleteCommand,
}));

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KategorienTab } from '../KategorienTab';

describe('KategorienTab', () => {
  it('renders category list from data', () => {
    render(React.createElement(KategorienTab));
    expect(screen.getByText('IT-Sicherheit')).toBeInTheDocument();
    expect(screen.getByText('Datenschutz')).toBeInTheDocument();
  });

  it('shows add category button in command bar', () => {
    render(React.createElement(KategorienTab));
    expect(screen.getByText('Hinzufuegen')).toBeInTheDocument();
  });

  it('renders category name and description columns', () => {
    render(React.createElement(KategorienTab));
    // Column headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Beschreibung')).toBeInTheDocument();
  });

  it('renders description text for each category', () => {
    render(React.createElement(KategorienTab));
    expect(screen.getByText('IT-Sicherheitsrichtlinien')).toBeInTheDocument();
    expect(screen.getByText('Datenschutzrichtlinien')).toBeInTheDocument();
  });

  it('renders Active column header', () => {
    render(React.createElement(KategorienTab));
    expect(screen.getByText('Aktiv')).toBeInTheDocument();
  });
});
