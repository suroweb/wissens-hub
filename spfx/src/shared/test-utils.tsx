import * as React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { WissensHubContext, IWissensHubContext } from './context/WissensHubContext';
import { createMockServices } from './services/__mocks__';
import { MOCK_CURRENT_USER } from './services/__mocks__/mockData';
import { IServiceContainer } from './context/ServiceContainer';
import { UserRole } from './models/domain/types';
import { ToastProvider } from './components/ToastProvider';

export interface RenderOptions {
  services?: Partial<IServiceContainer>;
  role?: UserRole;
}

export function renderWithContext(
  ui: React.ReactElement,
  options: RenderOptions = {}
): RenderResult {
  const baseServices = createMockServices();
  const services = { ...baseServices, ...options.services } as IServiceContainer;

  const contextValue: IWissensHubContext = {
    services,
    currentUser: MOCK_CURRENT_USER,
    role: options.role || 'admin',
    isLoading: false,
  };

  return render(
    React.createElement(
      WissensHubContext.Provider,
      { value: contextValue },
      React.createElement(ToastProvider, null, ui)
    )
  );
}
