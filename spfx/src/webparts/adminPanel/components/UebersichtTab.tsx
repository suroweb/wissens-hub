import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer } from '@fluentui/react/lib/Shimmer';
import { useAdminReportsQuery, useReminderConfigQuery } from '../../../shared/hooks/queries';
import { useUpdateReminderConfigCommand } from '../../../shared/hooks/commands';
import { IArticleReport } from '../../../shared/interfaces/IAdminService';
import { getCategoryColor } from '../../../shared/utils/getCategoryColor';
import { getFreshnessLevel, getFreshnessLabel, getFreshnessColor } from '../../../shared/utils/freshnessUtils';
import { StatsCards } from './StatsCards';
import styles from './AdminPanel.module.scss';

const STATUS_FILTER_OPTIONS: IDropdownOption[] = [
  { key: 'all', text: 'Alle' },
  { key: 'Published', text: 'Veroffentlicht' },
  { key: 'Draft', text: 'Entwurf' },
  { key: 'InReview', text: 'In Prufung' },
  { key: 'Archived', text: 'Archiviert' },
];

const REMINDER_OPTIONS: IDropdownOption[] = [
  { key: 7, text: '7 Tage' },
  { key: 14, text: '14 Tage' },
  { key: 30, text: '30 Tage' },
  { key: 60, text: '60 Tage' },
  { key: 90, text: '90 Tage' },
];

function sortArticles(items: IArticleReport[], columnKey: string, descending: boolean): IArticleReport[] {
  const sorted = items.slice();
  sorted.sort((a: IArticleReport, b: IArticleReport) => {
    let valA: string | number;
    let valB: string | number;

    switch (columnKey) {
      case 'title':
        valA = a.title;
        valB = b.title;
        break;
      case 'status':
        valA = a.status;
        valB = b.status;
        break;
      case 'category':
        valA = a.category;
        valB = b.category;
        break;
      case 'freshness':
        valA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        valB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        break;
      case 'flagCount':
        valA = a.flagCount;
        valB = b.flagCount;
        break;
      default:
        return 0;
    }

    if (valA < valB) return descending ? 1 : -1;
    if (valA > valB) return descending ? -1 : 1;
    return 0;
  });
  return sorted;
}

export const UebersichtTab: React.FunctionComponent = () => {
  const reportsQuery = useAdminReportsQuery();
  const reminderQuery = useReminderConfigQuery();
  const reminderCommand = useUpdateReminderConfigCommand();

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [sortColumn, setSortColumn] = React.useState<string>('title');
  const [sortDescending, setSortDescending] = React.useState<boolean>(false);
  const [reminderFeedback, setReminderFeedback] = React.useState<string>('');

  const report = reportsQuery.state.status === 'success' ? reportsQuery.state.data : undefined;
  const articles: IArticleReport[] = report ? report.articles : [];
  const currentReminder = reminderQuery.state.status === 'success' ? reminderQuery.state.data : 30;

  // Filter articles by status
  const filteredArticles = React.useMemo(() => {
    if (statusFilter === 'all') return articles;
    const result: IArticleReport[] = [];
    for (let i = 0; i < articles.length; i++) {
      if (articles[i].status === statusFilter) {
        result.push(articles[i]);
      }
    }
    return result;
  }, [articles, statusFilter]);

  // Sort filtered articles
  const sortedArticles = React.useMemo(() => {
    return sortArticles(filteredArticles, sortColumn, sortDescending);
  }, [filteredArticles, sortColumn, sortDescending]);

  const onColumnClick = React.useCallback(
    (_ev?: React.MouseEvent<HTMLElement>, column?: IColumn): void => {
      if (!column) return;
      const newDescending = column.key === sortColumn ? !sortDescending : true;
      setSortColumn(column.key);
      setSortDescending(newDescending);
    },
    [sortColumn, sortDescending]
  );

  const handleReminderChange = React.useCallback(
    (_: React.FormEvent<HTMLElement>, option?: IDropdownOption): void => {
      if (!option) return;
      const days = option.key as number;
      setReminderFeedback('');
      reminderCommand.execute(days).then(success => {
        if (success) {
          setReminderFeedback('Intervall gespeichert.');
          reminderQuery.refetch();
        } else {
          setReminderFeedback('Fehler beim Speichern des Intervalls.');
        }
      }).catch(() => {
        setReminderFeedback('Fehler beim Speichern des Intervalls.');
      });
    },
    [reminderCommand, reminderQuery]
  );

  if (reportsQuery.state.status === 'loading' || reportsQuery.state.status === 'idle') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
    );
  }

  if (reportsQuery.state.status === 'error') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(MessageBar, { messageBarType: MessageBarType.error },
        'Fehler beim Laden der Ubersichtsdaten.',
      ),
    );
  }

  const columns: IColumn[] = [
    {
      key: 'title',
      name: 'Titel',
      fieldName: 'title',
      minWidth: 200,
      isResizable: true,
      isSorted: sortColumn === 'title',
      isSortedDescending: sortColumn === 'title' ? sortDescending : false,
      onColumnClick: onColumnClick,
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 80,
      isResizable: true,
      isSorted: sortColumn === 'status',
      isSortedDescending: sortColumn === 'status' ? sortDescending : false,
      onColumnClick: onColumnClick,
    },
    {
      key: 'category',
      name: 'Kategorie',
      fieldName: 'category',
      minWidth: 100,
      isResizable: true,
      isSorted: sortColumn === 'category',
      isSortedDescending: sortColumn === 'category' ? sortDescending : false,
      onColumnClick: onColumnClick,
      onRender: (item: IArticleReport) => {
        return React.createElement('span', {
          className: styles.categoryBadge,
          style: { backgroundColor: getCategoryColor(item.category) },
        }, item.category);
      },
    },
    {
      key: 'freshness',
      name: 'Aktualitat',
      minWidth: 120,
      isResizable: true,
      isSorted: sortColumn === 'freshness',
      isSortedDescending: sortColumn === 'freshness' ? sortDescending : false,
      onColumnClick: onColumnClick,
      onRender: (item: IArticleReport) => {
        const lastUpdated = item.lastUpdated instanceof Date ? item.lastUpdated : new Date(item.lastUpdated);
        const level = getFreshnessLevel(lastUpdated);
        const label = getFreshnessLabel(lastUpdated);
        const color = getFreshnessColor(level);
        return React.createElement('span', { style: { color: color } }, label);
      },
    },
    {
      key: 'flagCount',
      name: 'Meldungen',
      fieldName: 'flagCount',
      minWidth: 60,
      isSorted: sortColumn === 'flagCount',
      isSortedDescending: sortColumn === 'flagCount' ? sortDescending : false,
      onColumnClick: onColumnClick,
      onRender: (item: IArticleReport) => {
        if (item.flagCount > 0) {
          return React.createElement('span', { className: styles.flagCount }, item.flagCount);
        }
        return React.createElement('span', undefined, '0');
      },
    },
  ];

  return React.createElement('div', { className: styles.tabContent },
    // Stats cards
    report ? React.createElement(StatsCards, {
      totalArticles: report.totalArticles,
      publishedCount: report.publishedCount,
      draftCount: report.draftCount,
      inReviewCount: report.inReviewCount,
      flaggedCount: report.flaggedCount,
    }) : undefined,

    // Status filter
    React.createElement('div', { className: styles.filterRow },
      React.createElement(Dropdown, {
        label: 'Status-Filter',
        options: STATUS_FILTER_OPTIONS,
        selectedKey: statusFilter,
        onChange: (_: React.FormEvent<HTMLElement>, option?: IDropdownOption) => {
          setStatusFilter(option ? option.key as string : 'all');
        },
      }),
    ),

    // Sortable article table
    React.createElement(DetailsList, {
      items: sortedArticles,
      columns: columns,
      selectionMode: SelectionMode.none,
      onColumnHeaderClick: onColumnClick,
      compact: true,
    }),

    // Reminder interval section
    React.createElement('div', { className: styles.reminderSection },
      React.createElement('h3', undefined, 'Erinnerungs-Intervall fur Pflichtartikel'),
      React.createElement(Dropdown, {
        options: REMINDER_OPTIONS,
        selectedKey: currentReminder,
        onChange: handleReminderChange,
        styles: { root: { maxWidth: 200 } },
      }),
      React.createElement('p', { style: { fontSize: '12px', color: 'var(--neutralSecondary, #605e5c)', marginTop: '8px' } },
        'Benutzer werden nach diesem Intervall an ungelesene Pflichtartikel erinnert.',
      ),
      reminderFeedback ? React.createElement(MessageBar, {
        messageBarType: reminderFeedback.indexOf('Fehler') !== -1 ? MessageBarType.error : MessageBarType.success,
        onDismiss: () => setReminderFeedback(''),
        styles: { root: { marginTop: '8px' } },
      }, reminderFeedback) : undefined,
    ),
  );
};
