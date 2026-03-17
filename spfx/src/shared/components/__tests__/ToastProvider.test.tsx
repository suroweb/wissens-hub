import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, ToastContext } from '../ToastProvider';

// Test consumer component that exposes showToast via a button
function ToastTrigger(props: { message: string; type: 'success' | 'error' | 'warning' }): React.ReactElement {
  const context = React.useContext(ToastContext);
  return React.createElement(
    'button',
    {
      onClick: () => {
        if (context) {
          context.showToast(props.message, props.type);
        }
      },
    },
    'Trigger Toast'
  );
}

describe('ToastProvider', () => {
  it('renders children without toasts initially', () => {
    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement('span', null, 'Child content')
      )
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('showToast adds a MessageBar to the DOM', () => {
    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(ToastTrigger, { message: 'Erfolg', type: 'success' })
      )
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger Toast'));
    });

    // MessageBar renders with role="region" in Fluent UI
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('error toast renders a MessageBar', () => {
    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(ToastTrigger, { message: 'Fehler aufgetreten', type: 'error' })
      )
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger Toast'));
    });

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('toast auto-dismisses after 5 seconds', () => {
    jest.useFakeTimers();

    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(ToastTrigger, { message: 'Auto dismiss', type: 'success' })
      )
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger Toast'));
    });

    expect(screen.getByRole('region')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5001);
    });

    expect(screen.queryByRole('region')).toBeNull();

    jest.useRealTimers();
  });

  it('onDismiss removes the toast from DOM', () => {
    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(ToastTrigger, { message: 'Dismiss mich', type: 'warning' })
      )
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger Toast'));
    });

    expect(screen.getByRole('region')).toBeInTheDocument();

    // Click the dismiss button on the MessageBar
    const dismissButton = screen.getByRole('button', { name: /schlie/i });
    act(() => {
      fireEvent.click(dismissButton);
    });

    expect(screen.queryByRole('region')).toBeNull();
  });

  it('toast container element appears when toast is shown', () => {
    const { container } = render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(ToastTrigger, { message: 'Check container', type: 'success' })
      )
    );

    // No toast container initially
    expect(container.querySelector('.toastContainer')).toBeNull();

    act(() => {
      fireEvent.click(screen.getByText('Trigger Toast'));
    });

    // Toast container appears
    expect(container.querySelector('.toastContainer')).not.toBeNull();
  });
});
