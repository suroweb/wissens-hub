import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { getCategoryColor } from '../../dashboard/components/utils/getCategoryColor';
import { formatRelativeDate } from '../../dashboard/components/utils/formatRelativeDate';
import styles from './Freigabecenter.module.scss';
import * as strings from 'FreigabecenterWebPartStrings';
import * as sharedStrings from 'SharedStrings';

export interface IApprovalCardProps {
  article: IArticlePage;
  onApprove: (pageId: number) => void;
  onReject: (pageId: number) => void;
}

export const ApprovalCard: React.FunctionComponent<IApprovalCardProps> = ({
  article,
  onApprove,
  onReject,
}) => {
  const handleApprove = React.useCallback((): void => {
    onApprove(article.id);
  }, [article.id, onApprove]);

  const handleReject = React.useCallback((): void => {
    onReject(article.id);
  }, [article.id, onReject]);

  return (
    <div className={styles.approvalCard}>
      <span
        className={styles.categoryBadge}
        style={{ backgroundColor: getCategoryColor(article.category) }}
      >
        {article.category}
      </span>

      <h3 className={styles.cardTitle}>{article.title}</h3>

      <div className={styles.cardMeta}>
        {article.author.displayName} &middot; {formatRelativeDate(article.modifiedDate)}
      </div>

      <div className={styles.reviewerInfo}>
        {strings.ReviewerPrefix}{article.reviewerName || sharedStrings.NotAssigned}
      </div>

      {article.targetGroups.length > 0 && (
        <div className={styles.targetGroups}>
          {article.targetGroups.join(', ')}
        </div>
      )}

      <div className={styles.actionsRow}>
        <PrimaryButton
          text={strings.Approve}
          iconProps={{ iconName: 'CheckMark' }}
          onClick={handleApprove}
          ariaLabel={strings.Approve + ': ' + article.title}
        />
        <DefaultButton
          text={strings.Reject}
          iconProps={{ iconName: 'Cancel' }}
          onClick={handleReject}
          ariaLabel={strings.Reject + ': ' + article.title}
        />
      </div>
    </div>
  );
};
