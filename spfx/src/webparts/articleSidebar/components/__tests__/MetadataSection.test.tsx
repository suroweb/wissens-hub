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
  EditMetadata: 'Metadaten bearbeiten',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Author: 'Autor',
  Category: 'Kategorie',
  LastUpdated: 'Zuletzt aktualisiert',
  Version: 'Version',
  Status: 'Status',
  TargetGroups: 'Zielgruppen',
}), { virtual: true });

import * as React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { MetadataSection, IMetadataSectionProps } from '../MetadataSection';
import { MOCK_ARTICLES } from '../../../../shared/services/__mocks__/mockData';

describe('MetadataSection (SIDE-01, SIDE-08)', () => {
  const article = MOCK_ARTICLES[0]; // Passwort-Richtlinie, IT-Sicherheit, Published

  const defaultProps: IMetadataSectionProps = {
    article: article,
    contentVersion: 2,
    listId: '{MOCK-LIST-ID}',
    siteUrl: 'https://contoso.sharepoint.com/sites/WissensHub',
  };

  it('renders author name', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    expect(screen.getByText(article.author.displayName)).toBeInTheDocument();
  });

  it('renders article category', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    expect(screen.getByText(article.category)).toBeInTheDocument();
  });

  it('renders status', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    expect(screen.getByText(article.status)).toBeInTheDocument();
  });

  it('renders target groups', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    expect(screen.getByText(article.targetGroups.join(', '))).toBeInTheDocument();
  });

  it('renders last updated date in German format', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    // article.modifiedDate = 2025-11-17T10:00:00Z -> 17.11.2025
    expect(screen.getByText('17.11.2025')).toBeInTheDocument();
  });

  it('renders content version', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    expect(screen.getByText('2.0')).toBeInTheDocument();
  });

  it('renders all 6 metadata fields', () => {
    renderWithContext(React.createElement(MetadataSection, defaultProps));
    expect(screen.getByText('Autor')).toBeInTheDocument();
    expect(screen.getByText('Kategorie')).toBeInTheDocument();
    expect(screen.getByText('Zuletzt aktualisiert')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Zielgruppen')).toBeInTheDocument();
  });

  it('shows edit metadata button for editors', () => {
    renderWithContext(
      React.createElement(MetadataSection, defaultProps),
      { role: 'editor' }
    );
    expect(screen.getByText('Metadaten bearbeiten')).toBeInTheDocument();
  });

  it('hides edit metadata button for readers', () => {
    renderWithContext(
      React.createElement(MetadataSection, defaultProps),
      { role: 'reader' }
    );
    expect(screen.queryByText('Metadaten bearbeiten')).toBeNull();
  });
});
