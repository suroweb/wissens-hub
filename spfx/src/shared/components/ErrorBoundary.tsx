import * as React from 'react';
import { ITelemetryService } from '../services/TelemetryService';

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  telemetry: ITelemetryService;
  fallback: React.ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public state: IErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.telemetry.trackException(error, {
      componentStack: info.componentStack || 'unknown'
    });
  }

  public render(): React.ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
