import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import styles from './ToastProvider.module.scss';

export type ToastType = 'success' | 'error' | 'warning';

export interface IToast {
  id: string;
  message: string;
  type: ToastType;
}

export interface IToastContext {
  showToast(message: string, type: ToastType): void;
}

export const ToastContext = React.createContext<IToastContext | undefined>(undefined);

const TOAST_TYPES: Record<ToastType, MessageBarType> = {
  success: MessageBarType.success,
  error: MessageBarType.error,
  warning: MessageBarType.warning,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [toasts, setToasts] = React.useState<IToast[]>([]);
  const timerMapRef = React.useRef<Record<string, number>>({});

  // Cleanup all timers on unmount
  React.useEffect(() => {
    return () => {
      const timers = timerMapRef.current;
      Object.keys(timers).forEach((key) => {
        window.clearTimeout(timers[key]);
      });
    };
  }, []);

  const removeToast = React.useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timerMapRef.current[id]) {
      window.clearTimeout(timerMapRef.current[id]);
      delete timerMapRef.current[id];
    }
  }, []);

  const showToast = React.useCallback((message: string, type: ToastType): void => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const toast: IToast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    const timerId = window.setTimeout(() => {
      removeToast(id);
    }, 5000);
    timerMapRef.current[id] = timerId;
  }, [removeToast]);

  const contextValue = React.useMemo<IToastContext>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}
      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map((toast) => (
            <MessageBar
              key={toast.id}
              messageBarType={TOAST_TYPES[toast.type]}
              onDismiss={() => removeToast(toast.id)}
              dismissButtonAriaLabel="Schlie\u00DFen"
            >
              {toast.message}
            </MessageBar>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
