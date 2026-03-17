import * as React from 'react';
import { MessageBar, MessageBarType, DefaultButton } from '@fluentui/react';
import styles from './ErrorFallback.module.scss';

export interface IErrorFallbackProps {
  onRetry: () => void;
}

export const ErrorFallback: React.FC<IErrorFallbackProps> = (props) => {
  return (
    <div className={styles.errorContainer}>
      <MessageBar messageBarType={MessageBarType.error}>
        Etwas ist schiefgelaufen.
      </MessageBar>
      <DefaultButton
        text="Neu laden"
        onClick={props.onRetry}
        style={{ marginTop: 12 }}
      />
    </div>
  );
};
