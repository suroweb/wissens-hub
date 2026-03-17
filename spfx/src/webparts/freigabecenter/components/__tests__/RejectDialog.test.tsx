jest.mock('FreigabecenterWebPartStrings', () => ({
  RejectDialogTitle: 'Artikel ablehnen',
  ReasonLabel: 'Ablehnungsgrund',
  Reject: 'Ablehnen',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Cancel: 'Abbrechen',
}), { virtual: true });

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RejectDialog } from '../RejectDialog';

describe('RejectDialog', () => {
  it('renders dialog with required comment field when isOpen=true', () => {
    render(
      React.createElement(RejectDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: jest.fn(),
        onRejected: jest.fn(),
      })
    );
    expect(screen.getByText('Artikel ablehnen')).toBeInTheDocument();
    expect(screen.getByText('Ablehnungsgrund')).toBeInTheDocument();
  });

  it('disables submit button when comment is empty', () => {
    render(
      React.createElement(RejectDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: jest.fn(),
        onRejected: jest.fn(),
      })
    );
    const rejectBtn = screen.getByText('Ablehnen');
    expect(rejectBtn.closest('button')).toBeDisabled();
  });

  it('calls onRejected with comment when submitted', () => {
    const onRejected = jest.fn();
    render(
      React.createElement(RejectDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: jest.fn(),
        onRejected: onRejected,
      })
    );
    // Type a reason
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Needs more detail' } });

    // Button should now be enabled
    const rejectBtn = screen.getByText('Ablehnen');
    expect(rejectBtn.closest('button')).not.toBeDisabled();

    fireEvent.click(rejectBtn);
    expect(onRejected).toHaveBeenCalledWith('Needs more detail');
  });

  it('calls onDismiss when cancelled', () => {
    const onDismiss = jest.fn();
    render(
      React.createElement(RejectDialog, {
        isOpen: true,
        pageId: 7,
        articleTitle: 'Datensicherung-Konzept',
        onDismiss: onDismiss,
        onRejected: jest.fn(),
      })
    );
    const cancelBtn = screen.getByText('Abbrechen');
    fireEvent.click(cancelBtn);

    expect(onDismiss).toHaveBeenCalled();
  });
});
