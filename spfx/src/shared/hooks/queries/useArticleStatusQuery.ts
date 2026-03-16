import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IArticlePage } from '../../models/domain/IArticlePage';
import { IReadConfirmation } from '../../models/domain/IReadConfirmation';
import { useWissensHub } from '../../context';

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
  const [state, setState] = React.useState<QueryState<IArticleStatus>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });

    const readStatusResult = await services.readConfirmationService.getReadStatus(pageId);
    if (!readStatusResult.success) {
      setState({ status: 'error', error: readStatusResult.error });
      return;
    }

    const articlesResult = await services.pageService.getPublishedArticles();
    if (!articlesResult.success) {
      setState({ status: 'error', error: articlesResult.error });
      return;
    }

    let article: IArticlePage | undefined;
    for (let i = 0; i < articlesResult.data.length; i++) {
      if (articlesResult.data[i].id === pageId) {
        article = articlesResult.data[i];
        break;
      }
    }

    const contentVersion = mockContentVersions[pageId] || 1;

    setState({
      status: 'success',
      data: {
        article: article,
        readConfirmation: readStatusResult.data,
        contentVersion: contentVersion,
      },
    });
  }, [services, pageId]);

  React.useEffect(() => {
    fetch().catch(() => { /* error state handled in fetch */ });
  }, [fetch]);

  return { state: state, refetch: fetch };
}
