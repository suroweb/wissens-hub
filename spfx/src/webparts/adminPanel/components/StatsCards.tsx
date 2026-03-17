import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './AdminPanel.module.scss';

interface IStatsCardsProps {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  inReviewCount: number;
  flaggedCount: number;
}

interface IStatDef {
  icon: string;
  count: number;
  label: string;
}

export const StatsCards: React.FunctionComponent<IStatsCardsProps> = (props) => {
  const { totalArticles, publishedCount, draftCount, inReviewCount, flaggedCount } = props;

  const stats: IStatDef[] = [
    { icon: 'ViewAll', count: totalArticles, label: 'Gesamt' },
    { icon: 'PublishContent', count: publishedCount, label: 'Veroffentlicht' },
    { icon: 'Edit', count: draftCount, label: 'Entwurf' },
    { icon: 'Clock', count: inReviewCount, label: 'In Prufung' },
    { icon: 'Warning', count: flaggedCount, label: 'Gemeldet' },
  ];

  const cards: React.ReactElement[] = [];
  for (let i = 0; i < stats.length; i++) {
    cards.push(
      React.createElement('div', { key: stats[i].label, className: styles.statCard },
        React.createElement(Icon, { iconName: stats[i].icon, className: styles.statIcon }),
        React.createElement('span', { className: styles.statCount }, stats[i].count),
        React.createElement('span', { className: styles.statLabel }, stats[i].label),
      )
    );
  }

  return React.createElement('div', { className: styles.statsGrid }, ...cards);
};
