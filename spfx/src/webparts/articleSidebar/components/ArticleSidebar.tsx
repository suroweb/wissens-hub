import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import styles from './ArticleSidebar.module.scss';
import type { IArticleSidebarProps } from './IArticleSidebarProps';
import { useArticleStatusQuery } from '../../../shared/hooks';
import { useWissensHub } from '../../../shared/context';
import { MetadataSection } from './MetadataSection';
import { TableOfContents } from './TableOfContents';

const shimmerRows: React.ReactElement[] = [];
for (let i = 0; i < 6; i++) {
  shimmerRows.push(
    React.createElement(
      'div',
      { key: i, className: styles.shimmerRow },
      React.createElement(Shimmer, {
        shimmerElements: [
          { type: ShimmerElementType.circle, height: 16 },
          { type: ShimmerElementType.gap, width: 8 },
          { type: ShimmerElementType.line, width: 80 },
          { type: ShimmerElementType.gap, width: 8 },
          { type: ShimmerElementType.line },
        ],
      })
    )
  );
}

const MetadataShimmer: React.FC = () => {
  return React.createElement('div', { className: styles.shimmerContainer }, shimmerRows);
};

const ArticleSidebar: React.FunctionComponent<IArticleSidebarProps> = ({
  pageId,
  listId,
  siteUrl,
  hasTeamsContext,
}) => {
  const { isLoading } = useWissensHub();
  const articleStatus = useArticleStatusQuery(pageId);

  if (isLoading) {
    // eslint-disable-next-line @rushstack/no-new-null
    return null as unknown as React.ReactElement;
  }

  if (articleStatus.state.status === 'loading' || articleStatus.state.status === 'idle') {
    return React.createElement(MetadataShimmer, undefined);
  }

  if (articleStatus.state.status === 'error') {
    return React.createElement(
      MessageBar,
      { messageBarType: MessageBarType.error },
      'Fehler beim Laden der Artikeldaten.'
    );
  }

  const { article, contentVersion } = articleStatus.state.data;

  const sidebarClassName = hasTeamsContext
    ? styles.articleSidebar + ' ' + styles.teams
    : styles.articleSidebar;

  return React.createElement(
    'section',
    { className: sidebarClassName },
    article && React.createElement(MetadataSection, {
      article: article,
      contentVersion: contentVersion,
      listId: listId,
      siteUrl: siteUrl,
    }),
    React.createElement('div', { className: styles.divider }),
    // ReadStatusSection will be added in Plan 02
    React.createElement('div', { className: styles.divider }),
    React.createElement(TableOfContents, undefined),
    React.createElement('div', { className: styles.divider }),
    React.createElement(
      'div',
      { className: styles.versionHistory },
      React.createElement(Icon, { iconName: 'History' }),
      React.createElement(
        'a',
        {
          href: siteUrl + '/_layouts/15/Versions.aspx?list=' + encodeURIComponent(listId) + '&ID=' + pageId,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: styles.versionHistoryLink,
        },
        'Versionsverlauf anzeigen'
      )
    )
  );
};

export default ArticleSidebar;
