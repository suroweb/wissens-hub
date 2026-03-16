import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IFlag } from '../../../shared/models/domain/IFlag';
import styles from './Freigabecenter.module.scss';

export interface IFlaggedCardProps {
  flag: IFlag;
  articleTitle: string;
  articleUrl: string;
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dd = day < 10 ? '0' + day : '' + day;
  const mm = month < 10 ? '0' + month : '' + month;
  return dd + '.' + mm + '.' + year;
}

export const FlaggedCard: React.FunctionComponent<IFlaggedCardProps> = ({
  flag,
  articleTitle,
  articleUrl,
}) => {
  return (
    <div className={styles.flaggedCard}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Icon iconName="Warning" className={styles.warningIcon} />
        <h3 className={styles.cardTitle} style={{ margin: 0 }}>{articleTitle}</h3>
      </div>

      <div className={styles.cardMeta}>
        Gemeldet von: {flag.userDisplayName} am {formatDate(flag.flaggedDate)}
      </div>

      <div className={styles.flagReason}>
        {flag.reason}
      </div>

      <a
        href={articleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.articleLink}
      >
        <Icon iconName="OpenInNewWindow" />
        Artikel oeffnen
      </a>
    </div>
  );
};
