import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { RoleGate } from '../../../shared/components';
import { useSubmitForReviewCommand, useArchiveArticleCommand, useRestoreArticleCommand } from '../../../shared/hooks/commands';
import { ArticleStatus } from '../../../shared/models/domain/types';
import styles from './ArticleSidebar.module.scss';

export interface IApprovalActionsProps {
  pageId: number;
  articleStatus: ArticleStatus;
  onStatusChange: () => void;
}

export const ApprovalActions: React.FC<IApprovalActionsProps> = ({
  pageId,
  articleStatus,
  onStatusChange,
}) => {
  const submitForReview = useSubmitForReviewCommand();
  const archiveArticle = useArchiveArticleCommand();
  const restoreArticle = useRestoreArticleCommand();
  const [successMessage, setSuccessMessage] = React.useState<string | undefined>(undefined);

  // Clear success message after 3 seconds
  React.useEffect(() => {
    if (successMessage === undefined) return;
    const timer = setTimeout(() => {
      setSuccessMessage(undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSubmitForReview = React.useCallback(async (): Promise<void> => {
    const success = await submitForReview.execute(pageId);
    if (success) {
      setSuccessMessage('Zur Prüfung eingereicht');
      onStatusChange();
    }
  }, [pageId, submitForReview, onStatusChange]);

  const handleArchive = React.useCallback(async (): Promise<void> => {
    const success = await archiveArticle.execute(pageId);
    if (success) {
      setSuccessMessage('Artikel archiviert');
      onStatusChange();
    }
  }, [pageId, archiveArticle, onStatusChange]);

  const handleRestore = React.useCallback(async (): Promise<void> => {
    const success = await restoreArticle.execute(pageId);
    if (success) {
      setSuccessMessage('Artikel wiederhergestellt');
      onStatusChange();
    }
  }, [pageId, restoreArticle, onStatusChange]);

  return React.createElement(
    'div',
    { className: styles.approvalActions },
    articleStatus === 'Draft' && React.createElement(
      RoleGate,
      { minimumRole: 'editor', children: React.createElement(PrimaryButton, {
        text: 'Zur Prüfung einreichen',
        iconProps: { iconName: 'Send' },
        onClick: handleSubmitForReview,
        disabled: submitForReview.state.status === 'executing',
      })}
    ),
    articleStatus === 'Published' && React.createElement(
      RoleGate,
      { minimumRole: 'reviewer', children: React.createElement(DefaultButton, {
        text: 'Archivieren',
        iconProps: { iconName: 'Archive' },
        onClick: handleArchive,
        disabled: archiveArticle.state.status === 'executing',
      })}
    ),
    articleStatus === 'Archived' && React.createElement(
      RoleGate,
      { minimumRole: 'reviewer', children: React.createElement(DefaultButton, {
        text: 'Wiederherstellen',
        iconProps: { iconName: 'Undo' },
        onClick: handleRestore,
        disabled: restoreArticle.state.status === 'executing',
      })}
    ),
    successMessage !== undefined && React.createElement(
      MessageBar,
      { messageBarType: MessageBarType.success },
      successMessage
    )
  );
};
