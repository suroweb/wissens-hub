import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws on render to trigger error boundary
function ThrowingComponent(): React.ReactElement {
  throw new Error('Test component error');
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;
  const mockTelemetry = {
    trackEvent: jest.fn(),
    trackException: jest.fn(),
    trackPageView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error noise from React error boundary logging
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      React.createElement(ErrorBoundary, {
        telemetry: mockTelemetry,
        fallback: React.createElement('div', null, 'Fallback'),
        children: React.createElement('span', null, 'Child content'),
      })
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders fallback when child component throws', () => {
    render(
      React.createElement(ErrorBoundary, {
        telemetry: mockTelemetry,
        fallback: React.createElement('div', null, 'Something went wrong'),
        children: React.createElement(ThrowingComponent),
      })
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls telemetry.trackException on error', () => {
    render(
      React.createElement(ErrorBoundary, {
        telemetry: mockTelemetry,
        fallback: React.createElement('div', null, 'Fallback'),
        children: React.createElement(ThrowingComponent),
      })
    );

    expect(mockTelemetry.trackException).toHaveBeenCalledTimes(1);
    expect(mockTelemetry.trackException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('passes componentStack in trackException properties', () => {
    render(
      React.createElement(ErrorBoundary, {
        telemetry: mockTelemetry,
        fallback: React.createElement('div', null, 'Fallback'),
        children: React.createElement(ThrowingComponent),
      })
    );

    const callArgs = mockTelemetry.trackException.mock.calls[0];
    const props = callArgs[1];
    expect(props).toHaveProperty('componentStack');
    expect(typeof props.componentStack).toBe('string');
  });
});
