import * as React from 'react';
import styles from './Freigabecenter.module.scss';
import type { IFreigabecenterProps } from './IFreigabecenterProps';
import { Icon } from '@fluentui/react/lib/Icon';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer } from '@fluentui/react/lib/Shimmer';
import { useWissensHub } from '../../../shared/context';
import { usePendingApprovalsQuery, useFlaggedArticlesQuery, useArticlesQuery } from '../../../shared/hooks/queries';
import { useApproveArticleCommand, useRejectArticleCommand } from '../../../shared/hooks/commands';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { IFlag } from '../../../shared/models/domain/IFlag';
import { PendingTab } from './PendingTab';
import { FlaggedTab } from './FlaggedTab';
import { StaleTab } from './StaleTab';
import { ApproveDialog } from './ApproveDialog';
import { RejectDialog } from './RejectDialog';

const STALE_THRESHOLD_DAYS = 90;

const Freigabecenter: React.FunctionComponent<IFreigabecenterProps> = (props) => {
  const { hasTeamsContext } = props;
  const { isLoading: contextLoading } = useWissensHub();

  // Data hooks
  const pendingQuery = usePendingApprovalsQuery();
  const flaggedQuery = useFlaggedArticlesQuery();
  const articlesQuery = useArticlesQuery();
  const approveCommand = useApproveArticleCommand();
  const rejectCommand = useRejectArticleCommand();

  // State
  const [selectedReviewer, setSelectedReviewer] = React.useState<string>('all');
  const [approveTarget, setApproveTarget] = React.useState<number | undefined>(undefined);
  const [rejectTarget, setRejectTarget] = React.useState<number | undefined>(undefined);
  const [optimisticRemovals, setOptimisticRemovals] = React.useState<number[]>([]);

  // Extract data
  const pendingArticles: IArticlePage[] = pendingQuery.state.status === 'success'
    ? pendingQuery.state.data : [];
  const flaggedFlags: IFlag[] = flaggedQuery.state.status === 'success'
    ? flaggedQuery.state.data : [];
  const publishedArticles: IArticlePage[] = articlesQuery.state.status === 'success'
    ? articlesQuery.state.data : [];

  // Combine all articles for the flagged tab join (flags can be on published or pending articles)
  const allArticles: IArticlePage[] = React.useMemo(() => {
    const combined: IArticlePage[] = [];
    const seenIds: number[] = [];
    for (let i = 0; i < publishedArticles.length; i++) {
      if (seenIds.indexOf(publishedArticles[i].id) === -1) {
        combined.push(publishedArticles[i]);
        seenIds.push(publishedArticles[i].id);
      }
    }
    for (let i = 0; i < pendingArticles.length; i++) {
      if (seenIds.indexOf(pendingArticles[i].id) === -1) {
        combined.push(pendingArticles[i]);
        seenIds.push(pendingArticles[i].id);
      }
    }
    return combined;
  }, [publishedArticles, pendingArticles]);

  // Derive reviewer dropdown options from all data sources (including flagged article reviewers)
  const reviewerOptions: IDropdownOption[] = React.useMemo(() => {
    const names: string[] = [];
    const addNames = (articles: IArticlePage[]): void => {
      for (let i = 0; i < articles.length; i++) {
        const name = articles[i].reviewerName;
        if (name && names.indexOf(name) === -1) {
          names.push(name);
        }
      }
    };
    addNames(pendingArticles);
    addNames(publishedArticles);
    // Also include reviewer names from articles that have flags
    for (let i = 0; i < flaggedFlags.length; i++) {
      for (let j = 0; j < allArticles.length; j++) {
        if (allArticles[j].id === flaggedFlags[i].pageId) {
          const name = allArticles[j].reviewerName;
          if (name && names.indexOf(name) === -1) {
            names.push(name);
          }
          break;
        }
      }
    }
    names.sort();

    const options: IDropdownOption[] = [{ key: 'all', text: 'Alle Prüfer' }];
    for (let i = 0; i < names.length; i++) {
      options.push({ key: names[i], text: names[i] });
    }
    return options;
  }, [pendingArticles, publishedArticles, flaggedFlags, allArticles]);

  // Filter by selected reviewer
  const filteredPending: IArticlePage[] = React.useMemo(() => {
    if (selectedReviewer === 'all') return pendingArticles;
    const result: IArticlePage[] = [];
    for (let i = 0; i < pendingArticles.length; i++) {
      if (pendingArticles[i].reviewerName === selectedReviewer) {
        result.push(pendingArticles[i]);
      }
    }
    return result;
  }, [pendingArticles, selectedReviewer]);

  // Apply optimistic removals to visible pending articles
  const visiblePending: IArticlePage[] = React.useMemo(() => {
    const result: IArticlePage[] = [];
    for (let i = 0; i < filteredPending.length; i++) {
      if (optimisticRemovals.indexOf(filteredPending[i].id) === -1) {
        result.push(filteredPending[i]);
      }
    }
    return result;
  }, [filteredPending, optimisticRemovals]);

  const filteredFlagged: IFlag[] = React.useMemo(() => {
    if (selectedReviewer === 'all') return flaggedFlags;
    const result: IFlag[] = [];
    for (let i = 0; i < flaggedFlags.length; i++) {
      // Find the article for this flag to check reviewer
      let matchesReviewer = false;
      for (let j = 0; j < allArticles.length; j++) {
        if (allArticles[j].id === flaggedFlags[i].pageId
            && allArticles[j].reviewerName === selectedReviewer) {
          matchesReviewer = true;
          break;
        }
      }
      if (matchesReviewer) {
        result.push(flaggedFlags[i]);
      }
    }
    return result;
  }, [flaggedFlags, allArticles, selectedReviewer]);

  // Stale articles: Published articles older than STALE_THRESHOLD_DAYS, sorted oldest first
  const filteredStale: IArticlePage[] = React.useMemo(() => {
    const now = Date.now();
    const stale: IArticlePage[] = [];
    for (let i = 0; i < publishedArticles.length; i++) {
      const article = publishedArticles[i];
      const daysSince = Math.floor((now - article.modifiedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > STALE_THRESHOLD_DAYS) {
        if (selectedReviewer === 'all' || article.reviewerName === selectedReviewer) {
          stale.push(article);
        }
      }
    }
    // Sort oldest first (ascending by modifiedDate)
    stale.sort((a, b) => a.modifiedDate.getTime() - b.modifiedDate.getTime());
    return stale;
  }, [publishedArticles, selectedReviewer]);

  // Tab counts
  const pendingCount = visiblePending.length;
  const flaggedCount = filteredFlagged.length;
  const staleCount = filteredStale.length;

  // Get article title helper for dialogs
  const getArticleTitle = React.useCallback((pageId: number | undefined): string => {
    if (pageId === undefined) return '';
    for (let i = 0; i < pendingArticles.length; i++) {
      if (pendingArticles[i].id === pageId) return pendingArticles[i].title;
    }
    return '';
  }, [pendingArticles]);

  // Approve handler with optimistic removal
  const handleApprove = React.useCallback((comment?: string): void => {
    if (approveTarget === undefined) return;
    const targetId = approveTarget;
    // Optimistic removal
    setOptimisticRemovals(prev => {
      const next = prev.slice();
      next.push(targetId);
      return next;
    });
    setApproveTarget(undefined);

    approveCommand.execute(targetId, comment).then(success => {
      if (!success) {
        // Revert optimistic removal on failure
        setOptimisticRemovals(prev => {
          const next: number[] = [];
          for (let i = 0; i < prev.length; i++) {
            if (prev[i] !== targetId) next.push(prev[i]);
          }
          return next;
        });
        pendingQuery.refetch();
      }
    }).catch(() => {
      pendingQuery.refetch();
    });
  }, [approveTarget, approveCommand, pendingQuery]);

  // Reject handler with optimistic removal
  const handleReject = React.useCallback((comment: string): void => {
    if (rejectTarget === undefined) return;
    const targetId = rejectTarget;
    // Optimistic removal
    setOptimisticRemovals(prev => {
      const next = prev.slice();
      next.push(targetId);
      return next;
    });
    setRejectTarget(undefined);

    rejectCommand.execute(targetId, comment).then(success => {
      if (!success) {
        setOptimisticRemovals(prev => {
          const next: number[] = [];
          for (let i = 0; i < prev.length; i++) {
            if (prev[i] !== targetId) next.push(prev[i]);
          }
          return next;
        });
        pendingQuery.refetch();
      }
    }).catch(() => {
      pendingQuery.refetch();
    });
  }, [rejectTarget, rejectCommand, pendingQuery]);

  // Loading state
  const isDataLoading = contextLoading
    || pendingQuery.state.status === 'loading'
    || pendingQuery.state.status === 'idle'
    || flaggedQuery.state.status === 'loading'
    || flaggedQuery.state.status === 'idle'
    || articlesQuery.state.status === 'loading'
    || articlesQuery.state.status === 'idle';

  // Error state
  const hasError = pendingQuery.state.status === 'error'
    || flaggedQuery.state.status === 'error'
    || articlesQuery.state.status === 'error';

  if (isDataLoading) {
    return (
      <section className={`${styles.freigabecenter} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.header}>
          <Icon iconName="Approve" className={styles.icon} />
          <h2>Freigabecenter</h2>
        </div>
        <div className={styles.shimmerContainer}>
          <Shimmer className={styles.shimmerRow} />
          <Shimmer className={styles.shimmerRow} />
          <Shimmer className={styles.shimmerRow} />
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className={`${styles.freigabecenter} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.header}>
          <Icon iconName="Approve" className={styles.icon} />
          <h2>Freigabecenter</h2>
        </div>
        <MessageBar messageBarType={MessageBarType.error}>
          Fehler beim Laden der Daten.
        </MessageBar>
      </section>
    );
  }

  return (
    <section className={`${styles.freigabecenter} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="Approve" className={styles.icon} />
        <h2>Freigabecenter</h2>
      </div>

      <Dropdown
        label="Prüfer"
        options={reviewerOptions}
        selectedKey={selectedReviewer}
        onChange={(_, option) => setSelectedReviewer(option ? option.key as string : 'all')}
        className={styles.reviewerFilter}
      />

      <Pivot>
        <PivotItem headerText={'Ausstehend (' + pendingCount + ')'} itemIcon="Clock">
          <PendingTab
            articles={visiblePending}
            onApprove={(pageId: number) => setApproveTarget(pageId)}
            onReject={(pageId: number) => setRejectTarget(pageId)}
          />
        </PivotItem>
        <PivotItem headerText={'Gemeldet (' + flaggedCount + ')'} itemIcon="Warning">
          <FlaggedTab flags={filteredFlagged} articles={allArticles} />
        </PivotItem>
        <PivotItem headerText={'Veraltet (' + staleCount + ')'} itemIcon="Clock">
          <StaleTab articles={filteredStale} />
        </PivotItem>
      </Pivot>

      <ApproveDialog
        isOpen={approveTarget !== undefined}
        pageId={approveTarget || 0}
        articleTitle={getArticleTitle(approveTarget)}
        onDismiss={() => setApproveTarget(undefined)}
        onApproved={(comment?: string) => handleApprove(comment)}
      />

      <RejectDialog
        isOpen={rejectTarget !== undefined}
        pageId={rejectTarget || 0}
        articleTitle={getArticleTitle(rejectTarget)}
        onDismiss={() => setRejectTarget(undefined)}
        onRejected={(comment: string) => handleReject(comment)}
      />
    </section>
  );
};

export default Freigabecenter;
