import * as React from 'react';
import { ToastContext, IToastContext } from '../components/ToastProvider';

export function useToast(): IToastContext {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
