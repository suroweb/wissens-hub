import * as React from 'react';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { ApprovalCard } from './ApprovalCard';
import styles from './Freigabecenter.module.scss';

export interface IPendingTabProps {
  articles: IArticlePage[];
  onApprove: (pageId: number) => void;
  onReject: (pageId: number) => void;
}

export const PendingTab: React.FunctionComponent<IPendingTabProps> = ({
  articles,
  onApprove,
  onReject,
}) => {
  if (articles.length === 0) {
    return (
      <div className={styles.emptyState}>
        Keine ausstehenden Genehmigungen
      </div>
    );
  }

  const cards: React.ReactElement[] = [];
  for (let i = 0; i < articles.length; i++) {
    cards.push(
      <ApprovalCard
        key={articles[i].id}
        article={articles[i]}
        onApprove={onApprove}
        onReject={onReject}
      />
    );
  }

  return (
    <div className={styles.tabContent}>
      {cards}
    </div>
  );
};
