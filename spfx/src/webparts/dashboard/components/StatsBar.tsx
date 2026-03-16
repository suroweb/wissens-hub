import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { RoleGate } from '../../../shared/components/RoleGate';
import styles from './Dashboard.module.scss';

export type StatFilter = 'unread' | 'favorites' | 'pending' | '';

export interface IStatsBarProps {
  unreadCount: number;
  favoritesCount: number;
  pendingReviewsCount: number;
  activeStatFilter: StatFilter;
  onStatClick: (filter: StatFilter) => void;
}

export const StatsBar: React.FunctionComponent<IStatsBarProps> = (props) => {
  const { unreadCount, favoritesCount, pendingReviewsCount, activeStatFilter, onStatClick } = props;

  return (
    <div className={styles.statsBar}>
      <button
        className={`${styles.statItem} ${activeStatFilter === 'unread' ? styles.statItemActive : ''}`}
        onClick={() => onStatClick(activeStatFilter === 'unread' ? '' : 'unread')}
        role="button"
        aria-pressed={activeStatFilter === 'unread'}
        type="button"
      >
        <Icon iconName="Mail" className={styles.statIcon} />
        <span className={styles.statCount}>{unreadCount}</span>
        <span className={styles.statLabel}>Ungelesen</span>
      </button>

      <button
        className={`${styles.statItem} ${activeStatFilter === 'favorites' ? styles.statItemActive : ''}`}
        onClick={() => onStatClick(activeStatFilter === 'favorites' ? '' : 'favorites')}
        role="button"
        aria-pressed={activeStatFilter === 'favorites'}
        type="button"
      >
        <Icon iconName="FavoriteStar" className={styles.statIcon} />
        <span className={styles.statCount}>{favoritesCount}</span>
        <span className={styles.statLabel}>Favoriten</span>
      </button>

      <RoleGate minimumRole="reviewer">
        <button
          className={`${styles.statItem} ${activeStatFilter === 'pending' ? styles.statItemActive : ''}`}
          onClick={() => onStatClick(activeStatFilter === 'pending' ? '' : 'pending')}
          role="button"
          aria-pressed={activeStatFilter === 'pending'}
          type="button"
        >
          <Icon iconName="ClipboardList" className={styles.statIcon} />
          <span className={styles.statCount}>{pendingReviewsCount}</span>
          <span className={styles.statLabel}>Offen</span>
        </button>
      </RoleGate>
    </div>
  );
};
