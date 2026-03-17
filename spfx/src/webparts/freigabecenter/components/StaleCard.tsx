import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { getCategoryColor } from '../../dashboard/components/utils/getCategoryColor';
import styles from './Freigabecenter.module.scss';
import * as strings from 'FreigabecenterWebPartStrings';
import * as sharedStrings from 'SharedStrings';

export interface IStaleCardProps {
  article: IArticlePage;
  daysSinceModified: number;
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dd = day < 10 ? '0' + day : '' + day;
  const mm = month < 10 ? '0' + month : '' + month;
  return dd + '.' + mm + '.' + year;
}

function getAgeColor(days: number): string {
  if (days >= 180) return '#f44336';
  if (days >= 120) return '#ff9800';
  return '#ffc107';
}

export const StaleCard: React.FunctionComponent<IStaleCardProps> = ({
  article,
  daysSinceModified,
}) => {
  const ageColor = getAgeColor(daysSinceModified);

  return (
    <div
      className={styles.staleCard}
      style={{ borderLeftColor: ageColor, borderLeftWidth: 4, borderLeftStyle: 'solid' }}
    >
      <span
        className={styles.categoryBadge}
        style={{ backgroundColor: getCategoryColor(article.category) }}
      >
        {article.category}
      </span>

      <h3 className={styles.cardTitle}>{article.title}</h3>

      <div className={styles.cardMeta}>
        {strings.LastModified.replace('{0}', formatDate(article.modifiedDate)).replace('{1}', '' + daysSinceModified)}
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.articleLink}
      >
        <Icon iconName="OpenInNewWindow" />
        {sharedStrings.OpenArticle}
      </a>
    </div>
  );
};
