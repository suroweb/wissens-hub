import * as React from 'react';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { StaleCard } from './StaleCard';
import styles from './Freigabecenter.module.scss';

export interface IStaleTabProps {
  articles: IArticlePage[];
}

export const StaleTab: React.FunctionComponent<IStaleTabProps> = ({
  articles,
}) => {
  if (articles.length === 0) {
    return (
      <div className={styles.emptyState}>
        Keine veralteten Artikel
      </div>
    );
  }

  const cards: React.ReactElement[] = [];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const daysSinceModified = Math.floor(
      (Date.now() - article.modifiedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    cards.push(
      <StaleCard
        key={article.id}
        article={article}
        daysSinceModified={daysSinceModified}
      />
    );
  }

  return (
    <div className={styles.tabContent}>
      {cards}
    </div>
  );
};
