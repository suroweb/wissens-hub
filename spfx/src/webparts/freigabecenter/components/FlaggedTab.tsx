import * as React from 'react';
import { IFlag } from '../../../shared/models/domain/IFlag';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { FlaggedCard } from './FlaggedCard';
import styles from './Freigabecenter.module.scss';

export interface IFlaggedTabProps {
  flags: IFlag[];
  articles: IArticlePage[];
}

function findArticleByPageId(articles: IArticlePage[], pageId: number): IArticlePage | undefined {
  for (let i = 0; i < articles.length; i++) {
    if (articles[i].id === pageId) {
      return articles[i];
    }
  }
  return undefined;
}

export const FlaggedTab: React.FunctionComponent<IFlaggedTabProps> = ({
  flags,
  articles,
}) => {
  if (flags.length === 0) {
    return (
      <div className={styles.emptyState}>
        Keine gemeldeten Artikel
      </div>
    );
  }

  const cards: React.ReactElement[] = [];
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    const article = findArticleByPageId(articles, flag.pageId);
    const title = article ? article.title : 'Unbekannter Artikel';
    const url = article ? article.url : '#';
    cards.push(
      <FlaggedCard
        key={flag.id}
        flag={flag}
        articleTitle={title}
        articleUrl={url}
      />
    );
  }

  return (
    <div className={styles.tabContent}>
      {cards}
    </div>
  );
};
