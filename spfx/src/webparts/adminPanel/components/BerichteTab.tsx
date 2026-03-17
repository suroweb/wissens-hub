import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer } from '@fluentui/react/lib/Shimmer';
import { useAdminReportsQuery } from '../../../shared/hooks/queries';
import { IArticleReport } from '../../../shared/interfaces/IAdminService';
import { ExportButton } from './ExportButton';
import { ReadReportDrilldown } from './ReadReportDrilldown';
import { exportToExcel, exportToCsv } from '../../../shared/utils/exportUtils';
import styles from './AdminPanel.module.scss';

const EXPORT_HEADERS = [
  { key: 'title', header: 'Titel', width: 30 },
  { key: 'status', header: 'Status', width: 15 },
  { key: 'category', header: 'Kategorie', width: 20 },
  { key: 'readCount', header: 'Gelesen', width: 10 },
  { key: 'targetUserCount', header: 'Zielgruppe', width: 10 },
  { key: 'flagCount', header: 'Meldungen', width: 10 },
];

export const BerichteTab: React.FunctionComponent = () => {
  const reportsQuery = useAdminReportsQuery();
  const [selectedPageId, setSelectedPageId] = React.useState<number | undefined>(undefined);

  const articles: IArticleReport[] = reportsQuery.state.status === 'success'
    ? reportsQuery.state.data.articles : [];

  const exportData = React.useMemo(() => {
    const data: Array<Record<string, unknown>> = [];
    for (let i = 0; i < articles.length; i++) {
      data.push({
        title: articles[i].title,
        status: articles[i].status,
        category: articles[i].category,
        readCount: articles[i].readCount,
        targetUserCount: articles[i].targetUserCount,
        flagCount: articles[i].flagCount,
      });
    }
    return data;
  }, [articles]);

  const handleExportCsv = React.useCallback((): void => {
    exportToCsv(exportData, EXPORT_HEADERS, 'Artikelbericht');
  }, [exportData]);

  const handleExportExcel = React.useCallback((): void => {
    exportToExcel(exportData, EXPORT_HEADERS, 'Artikelbericht').catch(() => { /* handled */ });
  }, [exportData]);

  // If drill-down selected, show ReadReportDrilldown
  if (selectedPageId !== undefined) {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(ReadReportDrilldown, {
        pageId: selectedPageId,
        onBack: () => setSelectedPageId(undefined),
      }),
    );
  }

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
        'Fehler beim Laden der Berichte.',
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
      onRender: (item: IArticleReport) => {
        return React.createElement('span', {
          style: { cursor: 'pointer', color: 'var(--themePrimary, #0078d4)' },
          onClick: () => setSelectedPageId(item.pageId),
        }, item.title);
      },
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 80,
      isResizable: true,
    },
    {
      key: 'category',
      name: 'Kategorie',
      fieldName: 'category',
      minWidth: 100,
      isResizable: true,
    },
    {
      key: 'lesequote',
      name: 'Lesequote',
      minWidth: 150,
      isResizable: true,
      onRender: (item: IArticleReport) => {
        const percent = item.targetUserCount > 0 ? item.readCount / item.targetUserCount : 0;
        return React.createElement('div', { className: styles.progressCell },
          React.createElement(ProgressIndicator, {
            percentComplete: percent,
            label: item.readCount + ' / ' + item.targetUserCount,
          }),
        );
      },
    },
    {
      key: 'flagCount',
      name: 'Meldungen',
      fieldName: 'flagCount',
      minWidth: 60,
      onRender: (item: IArticleReport) => {
        if (item.flagCount > 0) {
          return React.createElement('span', { className: styles.flagCount }, item.flagCount);
        }
        return React.createElement('span', undefined, '0');
      },
    },
  ];

  return React.createElement('div', { className: styles.tabContent },
    React.createElement(ExportButton, {
      onExportCsv: handleExportCsv,
      onExportExcel: handleExportExcel,
      disabled: articles.length === 0,
    }),
    React.createElement(DetailsList, {
      items: articles,
      columns: columns,
      selectionMode: SelectionMode.none,
      compact: true,
    }),
  );
};
