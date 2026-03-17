import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { useWissensHub } from '../../../shared/context';
import { useArticlesQuery } from '../../../shared/hooks/queries/useArticlesQuery';
import { useFavoritesQuery } from '../../../shared/hooks/queries/useFavoritesQuery';
import { useToggleFavoriteCommand } from '../../../shared/hooks/commands/useToggleFavoriteCommand';
import { usePendingApprovalsQuery } from '../../../shared/hooks/queries/usePendingApprovalsQuery';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { ArticleCard } from './ArticleCard';
import { ArticleListView } from './ArticleListView';
import { EmptyState } from './EmptyState';
import { StatsBar, StatFilter } from './StatsBar';
import { FilterBar } from './FilterBar';
import { ShimmerCard } from '../../../shared/components/ShimmerCard';
import { getSP } from '../../../shared/context/pnpSetup';
import '@pnp/sp/search';
import * as strings from 'DashboardWebPartStrings';

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
    {[1, 2, 3, 4, 5, 6].map(i => (
      <ShimmerCard key={i} />
    ))}
  </div>
);

interface IDashboardFilters {
  search: string;
  category: string;
  status: string;
  targetGroup: string;
  statFilter: StatFilter;
}

const INITIAL_FILTERS: IDashboardFilters = {
  search: '',
  category: '',
  status: '',
  targetGroup: '',
  statFilter: '',
};

const Dashboard: React.FunctionComponent<IDashboardProps> = (props) => {
  const { hasTeamsContext, containerWidth } = props;
  const { isLoading } = useWissensHub();

  const [viewMode, setViewMode] = React.useState<'card' | 'list'>('card');
  const [filters, setFilters] = React.useState<IDashboardFilters>(INITIAL_FILTERS);
  const [searchResultIds, setSearchResultIds] = React.useState<Set<number> | undefined>(undefined);

  const articlesQuery = useArticlesQuery();
  const favoritesQuery = useFavoritesQuery();
  const toggleFavorite = useToggleFavoriteCommand();
  const pendingApprovalsQuery = usePendingApprovalsQuery();

  // Derive articles array
  const articles: IArticlePage[] = articlesQuery.state.status === 'success'
    ? articlesQuery.state.data
    : [];

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

  // Stats computation (computed locally per Research Pitfall 1 -- avoid useUnreadCountQuery which uses MockApiClient)
  const stats = React.useMemo(() => {
    const allArticles = articlesQuery.state.status === 'success' ? articlesQuery.state.data : [];
    const unreadCount = allArticles.filter(a => !readPageIds.has(a.id)).length;
    const favCount = localFavorites.size;
    const pendingCount = pendingApprovalsQuery.state.status === 'success'
      ? pendingApprovalsQuery.state.data.length
      : 0;
    return { unreadCount, favoritesCount: favCount, pendingReviewsCount: pendingCount };
  }, [articlesQuery.state, readPageIds, localFavorites, pendingApprovalsQuery.state]);

  // Extract unique categories from loaded articles
  const categories: string[] = React.useMemo(() => {
    if (articlesQuery.state.status !== 'success') return [];
    const cats = new Set<string>(articlesQuery.state.data.map((a: IArticlePage) => a.category));
    return Array.from(cats).sort();
  }, [articlesQuery.state]);

  // Extract unique target groups from loaded articles
  const targetGroups: string[] = React.useMemo(() => {
    if (articlesQuery.state.status !== 'success') return [];
    const groups = new Set<string>();
    articlesQuery.state.data.forEach((a: IArticlePage) => {
      a.targetGroups.forEach((g: string) => groups.add(g));
    });
    return Array.from(groups).sort();
  }, [articlesQuery.state]);

  // Debounced search with stale request protection
  const searchVersionRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = React.useCallback((query: string): void => {
    setFilters(prev => ({ ...prev, search: query }));

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setSearchResultIds(undefined);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const version = ++searchVersionRef.current;
      try {
        if (articlesQuery.state.status === 'success') {
          const lowerQuery = query.toLowerCase();
          let matchedIds: Set<number>;

          try {
            const sp = getSP();
            const siteInfo = await sp.web.select('Url')();
            if (sp.search && siteInfo) {
              const results = await sp.search({
                Querytext: `${query} contentclass:STS_SitePage path:"${(siteInfo as { Url: string }).Url}/SitePages"`,
                SelectProperties: ['Title', 'Path', 'ListItemID'],
                RowLimit: 50,
                TrimDuplicates: false,
                EnableQueryRules: false,
              });
              const spIds = results.PrimarySearchResults
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((r: any) => parseInt(r.ListItemID || '0', 10))
                .filter((id: number) => !isNaN(id) && id > 0);
              if (spIds.length > 0) {
                matchedIds = new Set(spIds);
              } else {
                // SP Search returned no results (common in workbench) — fall through to client-side
                throw new Error('Empty SP Search results, falling back to client-side');
              }
            } else {
              throw new Error('Search not available');
            }
          } catch {
            // Fallback: client-side title search (workbench/mock mode)
            matchedIds = new Set(
              articlesQuery.state.data
                .filter(a => a.title.toLowerCase().indexOf(lowerQuery) >= 0)
                .map(a => a.id)
            );
          }

          if (version === searchVersionRef.current) {
            setSearchResultIds(matchedIds);
          }
        }
      } catch {
        // Search failed silently, keep showing all articles
        if (version === searchVersionRef.current) {
          setSearchResultIds(undefined);
        }
      }
    }, 300);
  }, [articlesQuery.state]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Composite filtering (replaces old sortedArticles)
  const filteredArticles = React.useMemo(() => {
    if (articlesQuery.state.status !== 'success') return [];
    let result = [...articlesQuery.state.data];

    // Search filter (ID matching from SP Search or client-side)
    if (searchResultIds !== undefined) {
      result = result.filter(a => searchResultIds.has(a.id));
    }

    // Dropdown filters (AND logic)
    if (filters.category) {
      result = result.filter(a => a.category === filters.category);
    }
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }
    if (filters.targetGroup) {
      result = result.filter(a => a.targetGroups.indexOf(filters.targetGroup) >= 0);
    }

    // Stat quick-filters (AND with dropdown filters)
    if (filters.statFilter === 'unread') {
      result = result.filter(a => !readPageIds.has(a.id));
    } else if (filters.statFilter === 'favorites') {
      result = result.filter(a => localFavorites.has(a.id));
    } else if (filters.statFilter === 'pending') {
      result = result.filter(a => a.status === 'InReview');
    }

    // Sort: modified date descending
    result.sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime());

    return result;
  }, [articlesQuery.state, searchResultIds, filters, readPageIds, localFavorites]);

  // Filter change handlers
  const handleStatClick = React.useCallback((filter: StatFilter): void => {
    setFilters(prev => ({
      ...prev,
      statFilter: prev.statFilter === filter ? '' : filter,
    }));
  }, []);

  const handleClearAllFilters = React.useCallback((): void => {
    setFilters(INITIAL_FILTERS);
    setSearchResultIds(undefined);
  }, []);

  // Determine empty state type
  const emptyStateType = React.useMemo((): 'no-results' | 'no-filter-match' | 'empty-hub' | undefined => {
    if (articlesQuery.state.status !== 'success') return undefined;
    if (articlesQuery.state.data.length === 0) return 'empty-hub';
    if (filteredArticles.length === 0) {
      if (filters.search.trim()) return 'no-results';
      return 'no-filter-match';
    }
    return undefined;
  }, [articlesQuery.state, filteredArticles, filters.search]);

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

  // Article click handler — open in new tab so the dashboard stays open
  const handleArticleClick = React.useCallback((url: string): void => {
    window.open(url, '_blank', 'noopener');
  }, []);

  if (isLoading) {
    // eslint-disable-next-line @rushstack/no-new-null
    return null as unknown as React.ReactElement;
  }

  return (
    <section className={`${styles.dashboard} ${hasTeamsContext ? styles.teams : ''}`} role="main" aria-label="WissensHub Dashboard">
      <div className={styles.dashboardContent}>
        {/* Stats bar -- Offen stat gated by RoleGate inside StatsBar component */}
        <StatsBar
          unreadCount={stats.unreadCount}
          favoritesCount={stats.favoritesCount}
          pendingReviewsCount={stats.pendingReviewsCount}
          activeStatFilter={filters.statFilter}
          onStatClick={handleStatClick}
        />

        {/* Filter bar with search, dropdowns, view toggle */}
        <FilterBar
          searchQuery={filters.search}
          onSearchChange={handleSearchChange}
          categoryFilter={filters.category}
          onCategoryChange={(v) => setFilters(prev => ({ ...prev, category: v }))}
          statusFilter={filters.status}
          onStatusChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
          targetGroupFilter={filters.targetGroup}
          onTargetGroupChange={(v) => setFilters(prev => ({ ...prev, targetGroup: v }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categories={categories}
          targetGroups={targetGroups}
          onClearAllFilters={handleClearAllFilters}
          siteUrl={window.location.pathname.split('/SitePages')[0] || '/sites/wissenshub'}
        />

        {/* Loading state */}
        {articlesQuery.state.status === 'loading' && <ShimmerGrid />}

        {/* Error state */}
        {articlesQuery.state.status === 'error' && (
          <div>{strings.ErrorLoadingArticles}</div>
        )}

        {/* Empty state */}
        {emptyStateType && (
          <EmptyState
            type={emptyStateType}
            searchQuery={filters.search}
            onClearFilters={handleClearAllFilters}
          />
        )}

        {/* Card grid view */}
        {articlesQuery.state.status === 'success' && filteredArticles.length > 0 && viewMode === 'card' && (
          <div className={`${styles.cardGrid} ${styles[`columns${gridColumns}` as keyof typeof styles]}`}>
            {filteredArticles.map(article => (
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
        {articlesQuery.state.status === 'success' && filteredArticles.length > 0 && viewMode === 'list' && (
          <ArticleListView
            articles={filteredArticles}
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
