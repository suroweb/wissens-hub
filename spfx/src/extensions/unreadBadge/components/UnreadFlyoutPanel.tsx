import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Icon } from '@fluentui/react/lib/Icon';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { getCategoryColor } from '../../../shared/utils/getCategoryColor';
import { formatRelativeDate } from '../../../shared/utils/formatRelativeDate';
import { IUnreadArticle } from '../models/IUnreadArticle';
import styles from './UnreadFlyoutPanel.module.scss';
import * as strings from 'UnreadBadgeApplicationCustomizerStrings';
import * as sharedStrings from 'SharedStrings';

export interface IUnreadFlyoutPanelProps {
  isOpen: boolean;
  articles: IUnreadArticle[];
  totalCount: number;
  isLoading: boolean;
  error: string | undefined;
  siteUrl: string;
  onDismiss: () => void;
  onArticleClick: (url: string) => void;
}

export const UnreadFlyoutPanel: React.FC<IUnreadFlyoutPanelProps> = ({
  isOpen,
  articles,
  totalCount,
  isLoading,
  error,
  siteUrl,
  onDismiss,
  onArticleClick,
}) => {
  // Sort: mandatory first, then by updatedAt descending
  const sortedArticles: IUnreadArticle[] = articles.slice().sort(
    (a: IUnreadArticle, b: IUnreadArticle) => {
      if (a.isMandatory && !b.isMandatory) return -1;
      if (!a.isMandatory && b.isMandatory) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  );

  const displayArticles: IUnreadArticle[] = sortedArticles.slice(0, 10);

  const handleKeyDown = React.useCallback(
    (url: string, e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onArticleClick(url);
      }
    },
    [onArticleClick]
  );

  const renderContent = (): React.ReactElement => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.medium} label={strings.LoadingUnreadArticles} />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Icon iconName="CheckMark" className={styles.emptyIcon} />
          <span className={styles.emptyText}>{strings.AllArticlesRead}</span>
        </div>
      );
    }

    return (
      <div>
        {displayArticles.map((article: IUnreadArticle) => (
          <div
            key={article.pageId}
            className={styles.articleItem}
            onClick={() => onArticleClick(article.url)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(article.url, e)}
          >
            <span
              className={styles.categoryBadge}
              style={{ backgroundColor: getCategoryColor(article.category) }}
            >
              {article.category}
            </span>
            <div className={styles.articleTitle}>{article.title}</div>
            <div className={styles.articleMeta}>
              {formatRelativeDate(article.updatedAt)}
              {article.isMandatory && (
                <span className={styles.mandatoryBadge}>{sharedStrings.MandatoryArticle}</span>
              )}
            </div>
          </div>
        ))}
        {totalCount > 10 && (
          <a
            href={siteUrl + '/SitePages/Home.aspx'}
            className={styles.showAllLink}
          >
            {strings.ShowAll.replace('{0}', '' + totalCount)}
          </a>
        )}
      </div>
    );
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.smallFixedFar}
      headerText={strings.UnreadArticlesHeader.replace('{0}', '' + totalCount)}
      isLightDismiss={true}
      closeButtonAriaLabel={strings.ClosePanel}
    >
      {renderContent()}
    </Panel>
  );
};

export default UnreadFlyoutPanel;
