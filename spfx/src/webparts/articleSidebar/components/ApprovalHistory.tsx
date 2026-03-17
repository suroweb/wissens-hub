import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { useApprovalHistoryQuery } from '../../../shared/hooks/queries';
import { ArticleStatus } from '../../../shared/models/domain/types';
import styles from './ArticleSidebar.module.scss';
import * as strings from 'ArticleSidebarWebPartStrings';
import * as sharedStrings from 'SharedStrings';

export interface IApprovalHistoryProps {
  pageId: number;
}

function formatGermanDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dd = day < 10 ? '0' + day : '' + day;
  const mm = month < 10 ? '0' + month : '' + month;
  return dd + '.' + mm + '.' + year;
}

function getActionIcon(fromStatus: ArticleStatus, toStatus: ArticleStatus): string {
  if (toStatus === 'Published' && fromStatus === 'InReview') return 'Accept';
  if (toStatus === 'Published' && fromStatus === 'Archived') return 'Accept';
  if (toStatus === 'Draft' && fromStatus === 'InReview') return 'Cancel';
  if (toStatus === 'InReview') return 'Send';
  if (toStatus === 'Archived') return 'Archive';
  return 'History';
}

function getActionLabel(fromStatus: ArticleStatus, toStatus: ArticleStatus): string {
  if (toStatus === 'Published' && fromStatus === 'InReview') return strings.ActionApproved;
  if (toStatus === 'Published' && fromStatus === 'Archived') return strings.ActionRestored;
  if (toStatus === 'Draft' && fromStatus === 'InReview') return strings.ActionRejected;
  if (toStatus === 'InReview') return strings.ActionSubmitted;
  if (toStatus === 'Archived') return strings.ActionArchived;
  return toStatus;
}

export const ApprovalHistory: React.FC<IApprovalHistoryProps> = ({ pageId }) => {
  const historyQuery = useApprovalHistoryQuery(pageId);

  if (historyQuery.state.status === 'loading' || historyQuery.state.status === 'idle') {
    return React.createElement('div', { className: styles.approvalHistory },
      React.createElement('h3', undefined, strings.ApprovalHistoryTitle),
      React.createElement('div', undefined, sharedStrings.Loading)
    );
  }

  if (historyQuery.state.status === 'error') {
    return React.createElement('div', { className: styles.approvalHistory },
      React.createElement('h3', undefined, strings.ApprovalHistoryTitle),
      React.createElement('div', undefined, strings.ErrorLoadingHistory)
    );
  }

  const history = historyQuery.state.data;

  if (history.length === 0) {
    return React.createElement('div', { className: styles.approvalHistory },
      React.createElement('h3', undefined, strings.ApprovalHistoryTitle),
      React.createElement('div', { style: { fontStyle: 'italic', fontSize: '13px' } }, strings.NoActionsYet)
    );
  }

  const items: React.ReactElement[] = [];
  for (let i = 0; i < history.length; i++) {
    const action = history[i];
    const iconName = getActionIcon(action.fromStatus, action.toStatus);
    const label = getActionLabel(action.fromStatus, action.toStatus);

    const children: React.ReactElement[] = [
      React.createElement(Icon, { key: 'icon', iconName: iconName }),
      React.createElement('div', { key: 'action', className: styles.historyAction },
        React.createElement('span', undefined, strings.ActionByUser.replace('{0}', label).replace('{1}', action.actionByDisplayName)),
        React.createElement('span', { className: styles.historyDate }, formatGermanDate(action.actionDate)),
        action.comment !== undefined ? React.createElement('span', { className: styles.historyComment }, action.comment) : undefined
      ),
    ];

    items.push(
      React.createElement('div', { key: action.id, className: styles.historyItem }, children)
    );
  }

  return React.createElement('div', { className: styles.approvalHistory },
    React.createElement('h3', undefined, strings.ApprovalHistoryTitle),
    items
  );
};
