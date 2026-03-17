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
  TableOfContents: 'Inhaltsverzeichnis',
}), { virtual: true });

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { TableOfContents } from '../TableOfContents';

// Mock IntersectionObserver for jsdom (not available in test environment)
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).IntersectionObserver = class {
    public observe: jest.Mock = jest.fn();
    public unobserve: jest.Mock = jest.fn();
    public disconnect: jest.Mock = jest.fn();
  };
});

describe('TableOfContents (SIDE-06)', () => {
  beforeEach(() => {
    // Clear any existing CanvasZone content
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders nothing when no headings found', () => {
    renderWithContext(React.createElement(TableOfContents));
    // Component returns null when no headings
    expect(screen.queryByText('Inhaltsverzeichnis')).toBeNull();
  });

  it('renders heading list when CanvasZone headings exist', () => {
    // Set up DOM with CanvasZone headings before rendering
    const canvasZone = document.createElement('div');
    canvasZone.className = 'CanvasZone';
    const h2 = document.createElement('h2');
    h2.textContent = 'Introduction';
    const h3 = document.createElement('h3');
    h3.textContent = 'Details';
    canvasZone.appendChild(h2);
    canvasZone.appendChild(h3);
    document.body.appendChild(canvasZone);

    renderWithContext(React.createElement(TableOfContents));
    expect(screen.getByText('Inhaltsverzeichnis')).toBeInTheDocument();
    // Check TOC list items exist (using role="button" to distinguish from the h2/h3 elements)
    const tocItems = screen.getAllByRole('button');
    expect(tocItems.length).toBe(2);
    expect(tocItems[0].textContent).toBe('Introduction');
    expect(tocItems[1].textContent).toBe('Details');
  });

  it('each heading is clickable with role button and tabindex', () => {
    const canvasZone = document.createElement('div');
    canvasZone.className = 'CanvasZone';
    const h2 = document.createElement('h2');
    h2.textContent = 'Section One';
    canvasZone.appendChild(h2);
    document.body.appendChild(canvasZone);

    renderWithContext(React.createElement(TableOfContents));
    const tocItems = screen.getAllByRole('button');
    expect(tocItems.length).toBe(1);
    expect(tocItems[0]).toHaveAttribute('role', 'button');
    expect(tocItems[0]).toHaveAttribute('tabindex', '0');
  });

  it('handles click to scroll to heading', () => {
    const canvasZone = document.createElement('div');
    canvasZone.className = 'CanvasZone';
    const h2 = document.createElement('h2');
    h2.textContent = 'Scroll Target';
    h2.scrollIntoView = jest.fn();
    canvasZone.appendChild(h2);
    document.body.appendChild(canvasZone);

    renderWithContext(React.createElement(TableOfContents));
    const tocItems = screen.getAllByRole('button');
    fireEvent.click(tocItems[0]);
    // Verify scrollIntoView was called on the heading element
    expect(h2.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
