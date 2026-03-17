import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { RoleGate } from '../../../shared/components/RoleGate';
import styles from './ArticleSidebar.module.scss';
import * as strings from 'ArticleSidebarWebPartStrings';
import * as sharedStrings from 'SharedStrings';

export interface IMetadataSectionProps {
  article: IArticlePage;
  contentVersion: number;
  listId: string;
  siteUrl: string;
}

function formatGermanDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const pad = (n: number): string => n < 10 ? '0' + n : '' + n;
  return pad(day) + '.' + pad(month) + '.' + year;
}

export const MetadataSection: React.FC<IMetadataSectionProps> = ({
  article,
  contentVersion,
  listId,
  siteUrl,
}) => {
  const editUrl = siteUrl + '/_layouts/15/listform.aspx?PageType=6&ListId=' + encodeURIComponent(listId) + '&ID=' + article.id;

  const fields = [
    { icon: 'Contact', label: sharedStrings.Author, value: article.author.displayName },
    { icon: 'Tag', label: sharedStrings.Category, value: article.category },
    { icon: 'Clock', label: sharedStrings.LastUpdated, value: formatGermanDate(article.modifiedDate) },
    { icon: 'History', label: sharedStrings.Version, value: contentVersion + '.0' },
    { icon: 'StatusCircleCheckmark', label: sharedStrings.Status, value: article.status },
    { icon: 'People', label: sharedStrings.TargetGroups, value: article.targetGroups.join(', ') },
  ];

  return (
    <div className={styles.metadataSection}>
      {fields.map((field, index) => (
        <div key={index} className={styles.metaRow}>
          <Icon iconName={field.icon} className={styles.metaIcon} />
          <span className={styles.metaLabel}>{field.label}</span>
          <span className={styles.metaValue}>{field.value}</span>
        </div>
      ))}
      <RoleGate minimumRole="editor">
        <div className={styles.editButton}>
          <DefaultButton
            text={strings.EditMetadata}
            iconProps={{ iconName: 'Edit' }}
            onClick={() => window.open(editUrl, '_blank')}
          />
        </div>
      </RoleGate>
    </div>
  );
};
