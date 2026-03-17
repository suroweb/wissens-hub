import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { getCategoryColor } from './utils/getCategoryColor';
import { formatRelativeDate } from './utils/formatRelativeDate';
import styles from './Dashboard.module.scss';
import * as sharedStrings from 'SharedStrings';

export interface IArticleCardProps {
  article: IArticlePage;
  isUnread: boolean;
  isFavorite: boolean;
  onFavoriteToggle: (pageId: number) => void;
  onClick: (url: string) => void;
}

export const ArticleCard: React.FunctionComponent<IArticleCardProps> = ({
  article,
  isUnread,
  isFavorite,
  onFavoriteToggle,
  onClick,
}) => {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(article.url);
      }
    },
    [article.url, onClick]
  );

  const handleFavoriteClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      onFavoriteToggle(article.id);
    },
    [article.id, onFavoriteToggle]
  );

  const cardClassName = isUnread
    ? `${styles.card} ${styles.unread}`
    : styles.card;

  return (
    <div
      className={cardClassName}
      role="button"
      tabIndex={0}
      onClick={() => onClick(article.url)}
      onKeyDown={handleKeyDown}
    >
      <span
        className={styles.categoryBadge}
        style={{ backgroundColor: getCategoryColor(article.category) }}
      >
        {article.category}
      </span>

      <h3 className={styles.cardTitle}>
        {isUnread && <span className={styles.unreadDot} />}
        {article.title}
      </h3>

      <div className={styles.cardMeta}>
        {article.author.displayName} &middot; {formatRelativeDate(article.modifiedDate)}
      </div>

      <div className={styles.cardBottom}>
        <button
          className={`${styles.favoriteButton}${isFavorite ? ` ${styles.favorited}` : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? sharedStrings.RemoveFavorite : sharedStrings.AddFavorite}
          type="button"
        >
          <Icon iconName={isFavorite ? 'FavoriteStarFill' : 'FavoriteStar'} />
        </button>
        {article.isMandatory && (
          <span className={styles.mandatoryBadge}>{sharedStrings.MandatoryArticle}</span>
        )}
      </div>
    </div>
  );
};
