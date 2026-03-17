import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IUnreadArticle } from '../models/IUnreadArticle';
import { UnreadFlyoutPanel } from './UnreadFlyoutPanel';
import styles from './UnreadBadgeHeader.module.scss';
import * as strings from 'UnreadBadgeApplicationCustomizerStrings';

export interface IUnreadBadgeHeaderProps {
  articles: IUnreadArticle[];
  isLoading: boolean;
  error: string | undefined;
  siteUrl: string;
}

export const UnreadBadgeHeader: React.FC<IUnreadBadgeHeaderProps> = ({
  articles,
  isLoading,
  error,
  siteUrl,
}) => {
  const [isPanelOpen, setIsPanelOpen] = React.useState<boolean>(false);
  const [localArticles, setLocalArticles] = React.useState<IUnreadArticle[]>(articles);

  // Sync localArticles when props.articles changes (e.g., loading completes)
  React.useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  // Listen for CustomEvent from Article Sidebar mark-as-read
  React.useEffect(() => {
    const handler = (e: Event): void => {
      const pageId: number = (e as CustomEvent).detail.pageId;
      setLocalArticles(prev => prev.filter(a => a.pageId !== pageId));
    };
    document.addEventListener('wissenshub:article-read', handler);
    return () => {
      document.removeEventListener('wissenshub:article-read', handler);
    };
  }, []);

  const displayCount: string = localArticles.length > 99 ? '99+' : String(localArticles.length);

  const handleBellClick = React.useCallback((): void => {
    setIsPanelOpen(prev => !prev);
  }, []);

  const handlePanelDismiss = React.useCallback((): void => {
    setIsPanelOpen(false);
  }, []);

  const handleArticleClick = React.useCallback((url: string): void => {
    setIsPanelOpen(false);
    window.location.href = url;
  }, []);

  return (
    <div className={styles.container}>
      <button
        className={styles.bellButton}
        onClick={handleBellClick}
        aria-label={strings.UnreadArticlesAriaLabel.replace('{0}', displayCount)}
        type="button"
      >
        <Icon iconName="Ringer" className={styles.bellIcon} />
        {localArticles.length > 0 && (
          <span className={styles.badge}>{displayCount}</span>
        )}
      </button>
      <UnreadFlyoutPanel
        isOpen={isPanelOpen}
        articles={localArticles}
        totalCount={localArticles.length}
        isLoading={isLoading}
        error={error}
        siteUrl={siteUrl}
        onDismiss={handlePanelDismiss}
        onArticleClick={handleArticleClick}
      />
    </div>
  );
};

export default UnreadBadgeHeader;
