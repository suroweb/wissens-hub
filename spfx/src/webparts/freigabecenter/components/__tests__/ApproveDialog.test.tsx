jest.mock('FreigabecenterWebPartStrings', () => ({
  ApproveDialogTitle: 'Artikel genehmigen',
  CommentLabel: 'Kommentar (optional)',
  Approve: 'Genehmigen',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Cancel: 'Abbrechen',
}), { virtual: true });

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApproveDialog } from '../ApproveDialog';

describe('ApproveDialog', () => {
  it('renders dialog with optional comment field when isOpen=true', () => {
    render(
      React.createElement(ApproveDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: jest.fn(),
        onApproved: jest.fn(),
      })
    );
    expect(screen.getByText('Artikel genehmigen')).toBeInTheDocument();
    expect(screen.getByText('Kommentar (optional)')).toBeInTheDocument();
  });

  it('calls onApproved callback with comment when submitted', () => {
    const onApproved = jest.fn();
    render(
      React.createElement(ApproveDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: jest.fn(),
        onApproved: onApproved,
      })
    );
    // Type a comment into the text field
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Looks good' } });

    // Click the Approve button
    const approveBtn = screen.getByText('Genehmigen');
    fireEvent.click(approveBtn);

    expect(onApproved).toHaveBeenCalledWith('Looks good');
  });

  it('calls onDismiss when cancelled', () => {
    const onDismiss = jest.fn();
    render(
      React.createElement(ApproveDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: onDismiss,
        onApproved: jest.fn(),
      })
    );
    const cancelBtn = screen.getByText('Abbrechen');
    fireEvent.click(cancelBtn);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('is not visible when isOpen=false', () => {
    render(
      React.createElement(ApproveDialog, {
        isOpen: false,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: jest.fn(),
        onApproved: jest.fn(),
      })
    );
    // Dialog with hidden=true should not show its title
    expect(screen.queryByText('Artikel genehmigen')).toBeNull();
  });
});
