import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { Icon } from '@fluentui/react/lib/Icon';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer } from '@fluentui/react/lib/Shimmer';
import { useDetailedReadStatsQuery } from '../../../shared/hooks/queries';
import { IUserReadStatus } from '../../../shared/interfaces/IAdminService';
import { ExportButton } from './ExportButton';
import { exportToExcel, exportToCsv } from '../../../shared/utils/exportUtils';
import styles from './AdminPanel.module.scss';

interface IReadReportDrilldownProps {
  pageId: number;
  onBack: () => void;
}

const EXPORT_HEADERS = [
  { key: 'displayName', header: 'Name', width: 30 },
  { key: 'hasRead', header: 'Gelesen', width: 10 },
  { key: 'readDate', header: 'Lesedatum', width: 20 },
];

function formatDate(date: Date | undefined): string {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return (day < 10 ? '0' : '') + day + '.' + (month < 10 ? '0' : '') + month + '.' + year;
}

function sortUsers(users: IUserReadStatus[]): IUserReadStatus[] {
  const readers: IUserReadStatus[] = [];
  const nonReaders: IUserReadStatus[] = [];

  for (let i = 0; i < users.length; i++) {
    if (users[i].hasRead) {
      readers.push(users[i]);
    } else {
      nonReaders.push(users[i]);
    }
  }

  // Sort readers by readDate descending
  readers.sort((a, b) => {
    const dateA = a.readDate ? new Date(a.readDate).getTime() : 0;
    const dateB = b.readDate ? new Date(b.readDate).getTime() : 0;
    return dateB - dateA;
  });

  // Sort non-readers alphabetically
  nonReaders.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return readers.concat(nonReaders);
}

export const ReadReportDrilldown: React.FunctionComponent<IReadReportDrilldownProps> = (props) => {
  const { pageId, onBack } = props;
  const statsQuery = useDetailedReadStatsQuery(pageId);

  const handleExportCsv = React.useCallback((): void => {
    if (statsQuery.state.status !== 'success') return;
    const data = statsQuery.state.data.users.map(u => ({
      displayName: u.displayName,
      hasRead: u.hasRead ? 'Ja' : 'Nein',
      readDate: formatDate(u.readDate),
    }));
    exportToCsv(data, EXPORT_HEADERS, 'Lesebericht_' + statsQuery.state.data.title);
  }, [statsQuery.state]);

  const handleExportExcel = React.useCallback((): void => {
    if (statsQuery.state.status !== 'success') return;
    const data = statsQuery.state.data.users.map(u => ({
      displayName: u.displayName,
      hasRead: u.hasRead ? 'Ja' : 'Nein',
      readDate: formatDate(u.readDate),
    }));
    exportToExcel(data, EXPORT_HEADERS, 'Lesebericht_' + statsQuery.state.data.title).catch(() => { /* handled */ });
  }, [statsQuery.state]);

  if (statsQuery.state.status === 'loading' || statsQuery.state.status === 'idle') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement('div', { className: styles.backLink, onClick: onBack },
        React.createElement(Icon, { iconName: 'Back' }),
        React.createElement('span', undefined, 'Zuruck zur Ubersicht'),
      ),
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
    );
  }

  if (statsQuery.state.status === 'error') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement('div', { className: styles.backLink, onClick: onBack },
        React.createElement(Icon, { iconName: 'Back' }),
        React.createElement('span', undefined, 'Zuruck zur Ubersicht'),
      ),
      React.createElement(MessageBar, { messageBarType: MessageBarType.error },
        'Fehler beim Laden der Lesedetails.',
      ),
    );
  }

  const stats = statsQuery.state.data;
  const sortedUsers = sortUsers(stats.users);
  const percent = stats.totalTargetUsers > 0 ? stats.readCount / stats.totalTargetUsers : 0;

  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'displayName',
      minWidth: 150,
      isResizable: true,
    },
    {
      key: 'status',
      name: 'Status',
      minWidth: 80,
      onRender: (item: IUserReadStatus) => {
        if (item.hasRead) {
          return React.createElement(Icon, {
            iconName: 'CheckMark',
            className: styles.readIcon + ' ' + styles.readIconGreen,
          });
        }
        return React.createElement(Icon, {
          iconName: 'Cancel',
          className: styles.readIcon + ' ' + styles.readIconRed,
        });
      },
    },
    {
      key: 'readDate',
      name: 'Lesedatum',
      minWidth: 120,
      onRender: (item: IUserReadStatus) => {
        return React.createElement('span', undefined, formatDate(item.readDate));
      },
    },
  ];

  return React.createElement('div', { className: styles.tabContent },
    React.createElement('div', { className: styles.backLink, onClick: onBack },
      React.createElement(Icon, { iconName: 'Back' }),
      React.createElement('span', undefined, 'Zuruck zur Ubersicht'),
    ),
    React.createElement('div', { className: styles.drilldownHeader },
      React.createElement('h3', undefined, stats.title),
    ),
    React.createElement('div', { style: { marginBottom: '16px' } },
      React.createElement('span', undefined, stats.readCount + ' von ' + stats.totalTargetUsers + ' Benutzern haben gelesen'),
      React.createElement(ProgressIndicator, { percentComplete: percent }),
    ),
    React.createElement(ExportButton, {
      onExportCsv: handleExportCsv,
      onExportExcel: handleExportExcel,
    }),
    React.createElement(DetailsList, {
      items: sortedUsers,
      columns: columns,
      selectionMode: SelectionMode.none,
      compact: true,
    }),
  );
};
