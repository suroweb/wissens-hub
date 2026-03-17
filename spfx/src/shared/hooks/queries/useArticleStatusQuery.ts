import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IArticlePage } from '../../models/domain/IArticlePage';
import { IReadConfirmation } from '../../models/domain/IReadConfirmation';
import { useWissensHub } from '../../context';
import { CACHE_TTLS } from '../../services/CacheService';

export interface IArticleStatus {
  article: IArticlePage | undefined;
  readConfirmation: IReadConfirmation | undefined;
  contentVersion: number; // current page content version (for version reset comparison)
}

// Mock content versions: pageId 1 has been updated to version 2 (triggers reset for existing confirmation at version 1)
// All other articles are at version 1
const mockContentVersions: Record<number, number> = { 1: 2 };

export function useArticleStatusQuery(pageId: number): {
  state: QueryState<IArticleStatus>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const cacheKey = 'articlestatus:' + pageId;
  const hasDataRef = React.useRef(false);

  const [state, setState] = React.useState<QueryState<IArticleStatus>>(() => {
    const cached = services.cache.get<IArticleStatus>(cacheKey);
    if (cached) {
      // eslint-disable-next-line require-atomic-updates
    hasDataRef.current = true;
      return { status: 'success', data: cached };
    }
    return { status: 'idle' };
  });

  const fetch = React.useCallback(async (): Promise<void> => {
    const hadData = hasDataRef.current;
    if (!hadData) {
      setState({ status: 'loading' });
    }

    const readStatusResult = await services.readConfirmationService.getReadStatus(pageId);
    if (!readStatusResult.success) {
      if (!hadData) {
        setState({ status: 'error', error: readStatusResult.error });
      }
      return;
    }

    // Use getArticleById so the article is returned regardless of its current
    // status (Draft, InReview, Published, Archived). The previous implementation
    // used getPublishedArticles() which lost the article after status changes,
    // causing the sidebar to fall back to a wrong default status.
    const articleResult = await services.pageService.getArticleById(pageId);
    const article: IArticlePage | undefined = articleResult.success
      ? articleResult.data
      : undefined;

    const contentVersion = mockContentVersions[pageId] || 1;

    const data: IArticleStatus = {
      article: article,
      readConfirmation: readStatusResult.data,
      contentVersion: contentVersion,
    };

    services.cache.set(cacheKey, data, CACHE_TTLS.READ_STATS);
    // eslint-disable-next-line require-atomic-updates
    hasDataRef.current = true;
    setState({ status: 'success', data: data });
  }, [services, pageId]);

  React.useEffect(() => {
    fetch().catch(() => { /* error state handled in fetch */ });
  }, [fetch]);

  return { state: state, refetch: fetch };
}
