import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import { Icon } from '@fluentui/react/lib/Icon';
import { useWissensHub } from '../../../shared/context';
import { useArticlesQuery } from '../../../shared/hooks/queries/useArticlesQuery';
import { useFavoritesQuery } from '../../../shared/hooks/queries/useFavoritesQuery';
import { useToggleFavoriteCommand } from '../../../shared/hooks/commands/useToggleFavoriteCommand';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { ArticleCard } from './ArticleCard';
import { ArticleListView } from './ArticleListView';
import { EmptyState } from './EmptyState';

/**
 * Local hook to resolve read status for a set of article IDs.
 * Calls readConfirmationService.getReadStatus for each article.
 * A result with success===true and data!==undefined means the article has been read.
 */
function useReadPageIds(articleIds: number[]): Set<number> {
  const { services } = useWissensHub();
  const [readIds, setReadIds] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (articleIds.length === 0) return;
    const load = async (): Promise<void> => {
      const ids = new Set<number>();
      for (const id of articleIds) {
        const result = await services.readConfirmationService.getReadStatus(id);
        if (result.success && result.data !== undefined) {
          ids.add(id);
        }
      }
      setReadIds(ids);
    };
    load().catch(() => { /* handled */ });
  }, [articleIds.join(','), services]);

  return readIds;
}

function getGridColumns(width: number): number {
  if (width > 800) return 3;
  if (width > 480) return 2;
  return 1;
}

const ShimmerGrid: React.FC = () => (
  <div className={styles.shimmerGrid}>
    {[1, 2, 3].map(i => (
      <div key={i} className={styles.shimmerCard}>
        <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '60%', height: 16 }]} />
        <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '90%', height: 20 }]} />
        <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '40%', height: 14 }]} />
      </div>
    ))}
  </div>
);

const Dashboard: React.FunctionComponent<IDashboardProps> = (props) => {
  const { hasTeamsContext, containerWidth } = props;
  const { isLoading } = useWissensHub();

  const [viewMode, setViewMode] = React.useState<'card' | 'list'>('card');

  const articlesQuery = useArticlesQuery();
  const favoritesQuery = useFavoritesQuery();
  const toggleFavorite = useToggleFavoriteCommand();

  // Derive sorted articles
  const articles: IArticlePage[] = articlesQuery.state.status === 'success'
    ? articlesQuery.state.data
    : [];

  const sortedArticles = React.useMemo(
    () => [...articles].sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime()),
    [articles]
  );

  // Article IDs for read status hook
  const articleIds = React.useMemo(() => articles.map(a => a.id), [articles]);
  const readPageIds = useReadPageIds(articleIds);

  // Favorite page IDs from query
  const favoritePageIds = React.useMemo(
    () => new Set(
      favoritesQuery.state.status === 'success'
        ? favoritesQuery.state.data.map(f => f.pageId)
        : []
    ),
    [favoritesQuery.state]
  );

  // Optimistic local favorites state
  const [localFavorites, setLocalFavorites] = React.useState<Set<number>>(new Set());

  // Sync localFavorites from server data
  React.useEffect(() => {
    setLocalFavorites(favoritePageIds);
  }, [favoritePageIds]);

  // Grid column count
  const gridColumns = getGridColumns(containerWidth);

  // Favorite toggle handler (optimistic UI)
  const handleFavoriteToggle = React.useCallback(async (pageId: number): Promise<void> => {
    // Optimistic toggle
    setLocalFavorites(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
    const success = await toggleFavorite.execute(pageId);
    if (!success) {
      // Revert on failure
      setLocalFavorites(prev => {
        const next = new Set(prev);
        if (next.has(pageId)) {
          next.delete(pageId);
        } else {
          next.add(pageId);
        }
        return next;
      });
      console.warn('Favorite toggle failed for page', pageId);
    }
  }, [toggleFavorite]);

  // Article click handler
  const handleArticleClick = React.useCallback((url: string): void => {
    window.location.href = url;
  }, []);

  if (isLoading) {
    // eslint-disable-next-line @rushstack/no-new-null
    return null as unknown as React.ReactElement;
  }

  return (
    <section className={`${styles.dashboard} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.dashboardContent}>
        {/* View toggle row */}
        <div className={styles.viewToggle}>
          <button
            onClick={() => setViewMode('card')}
            aria-pressed={viewMode === 'card'}
            type="button"
          >
            <Icon iconName="GridViewMedium" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            type="button"
          >
            <Icon iconName="List" />
          </button>
        </div>

        {/* Loading state */}
        {articlesQuery.state.status === 'loading' && <ShimmerGrid />}

        {/* Error state */}
        {articlesQuery.state.status === 'error' && (
          <div>Fehler beim Laden der Artikel</div>
        )}

        {/* Empty state */}
        {articlesQuery.state.status === 'success' && sortedArticles.length === 0 && (
          <EmptyState type="empty-hub" />
        )}

        {/* Card grid view */}
        {articlesQuery.state.status === 'success' && sortedArticles.length > 0 && viewMode === 'card' && (
          <div className={`${styles.cardGrid} ${styles[`columns${gridColumns}` as keyof typeof styles]}`}>
            {sortedArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isUnread={!readPageIds.has(article.id)}
                isFavorite={localFavorites.has(article.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {articlesQuery.state.status === 'success' && sortedArticles.length > 0 && viewMode === 'list' && (
          <ArticleListView
            articles={sortedArticles}
            readPageIds={readPageIds}
            favoritePageIds={localFavorites}
            onFavoriteToggle={handleFavoriteToggle}
            onArticleClick={handleArticleClick}
          />
        )}
      </div>
    </section>
  );
};

export default Dashboard;
