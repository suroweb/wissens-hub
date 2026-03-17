import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './Dashboard.module.scss';
import * as strings from 'DashboardWebPartStrings';

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
      message = strings.NoResultsFor.replace('{0}', searchQuery || '');
      break;
    case 'no-filter-match':
      iconName = 'Filter';
      message = strings.NoFilterMatch;
      break;
    case 'empty-hub':
      iconName = 'Page';
      message = strings.EmptyHub;
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
          {strings.ClearFilters}
        </button>
      )}
    </div>
  );
};
