import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './Dashboard.module.scss';

export interface IEmptyStateProps {
  type: 'no-results' | 'no-filter-match' | 'empty-hub';
  searchQuery?: string;
  onClearFilters?: () => void;
}

export const EmptyState: React.FunctionComponent<IEmptyStateProps> = ({
  type,
  searchQuery,
  onClearFilters,
}) => {
  let iconName: string;
  let message: string;

  switch (type) {
    case 'no-results':
      iconName = 'SearchIssue';
      message = `Keine Ergebnisse für '${searchQuery || ''}'`;
      break;
    case 'no-filter-match':
      iconName = 'Filter';
      message = 'Keine Artikel für diese Filter';
      break;
    case 'empty-hub':
      iconName = 'Page';
      message = 'Noch keine Artikel vorhanden';
      break;
  }

  return (
    <div className={styles.emptyState}>
      <Icon iconName={iconName} />
      <p>{message}</p>
      {type === 'no-filter-match' && onClearFilters && (
        <button
          className={styles.emptyStateLink}
          onClick={onClearFilters}
          type="button"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
};
