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
  FlagDialogTitle: 'Als veraltet melden',
  FlagDialogSubText: 'Bitte geben Sie einen Grund an.',
  ReasonLabel: 'Grund',
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  Submit: 'Melden',
  Cancel: 'Abbrechen',
}), { virtual: true });

const mockFlagExecute = jest.fn().mockResolvedValue(true);

jest.mock('../../../../shared/hooks/commands', () => ({
  useFlagArticleCommand: () => ({
    state: { status: 'idle' },
    execute: mockFlagExecute,
  }),
}));

import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { FlagDialog, IFlagDialogProps } from '../FlagDialog';

describe('FlagDialog (SIDE-04)', () => {
  const onDismiss = jest.fn();
  const onFlagSubmitted = jest.fn();

  const defaultProps: IFlagDialogProps = {
    isOpen: true,
    pageId: 1,
    onDismiss: onDismiss,
    onFlagSubmitted: onFlagSubmitted,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when isOpen is true', () => {
    renderWithContext(React.createElement(FlagDialog, defaultProps));
    expect(screen.getByText('Als veraltet melden')).toBeInTheDocument();
    expect(screen.getByText('Bitte geben Sie einen Grund an.')).toBeInTheDocument();
  });

  it('does not render dialog content when isOpen is false', () => {
    const props: IFlagDialogProps = {
      ...defaultProps,
      isOpen: false,
    };
    renderWithContext(React.createElement(FlagDialog, props));
    // Dialog with hidden=true does not render its content to the DOM
    expect(screen.queryByText('Als veraltet melden')).toBeNull();
  });

  it('shows submit (Melden) and cancel (Abbrechen) buttons', () => {
    renderWithContext(React.createElement(FlagDialog, defaultProps));
    expect(screen.getByText('Melden')).toBeInTheDocument();
    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
  });

  it('disables submit button when reason is empty', () => {
    renderWithContext(React.createElement(FlagDialog, defaultProps));
    const submitButton = screen.getByText('Melden').closest('button');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when reason text is entered', () => {
    renderWithContext(React.createElement(FlagDialog, defaultProps));
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Content is outdated' } });
    const submitButton = screen.getByText('Melden').closest('button');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit with reason text when form is submitted', async () => {
    renderWithContext(React.createElement(FlagDialog, defaultProps));
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Content is outdated' } });
    const submitButton = screen.getByText('Melden').closest('button')!;
    fireEvent.click(submitButton);
    // Wait for the async handler to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockFlagExecute).toHaveBeenCalledWith(1, 'Content is outdated');
  });

  it('calls onDismiss when cancel button is clicked', () => {
    renderWithContext(React.createElement(FlagDialog, defaultProps));
    const cancelButton = screen.getByText('Abbrechen');
    fireEvent.click(cancelButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
