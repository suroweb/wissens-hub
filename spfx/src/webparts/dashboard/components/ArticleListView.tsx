import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { Icon } from '@fluentui/react/lib/Icon';
import { IArticlePage } from '../../../shared/models/domain/IArticlePage';
import { getCategoryColor } from './utils/getCategoryColor';
import { formatRelativeDate } from './utils/formatRelativeDate';
import styles from './Dashboard.module.scss';
import * as strings from 'DashboardWebPartStrings';
import * as sharedStrings from 'SharedStrings';

export interface IArticleListViewProps {
  articles: IArticlePage[];
  readPageIds: Set<number>;
  favoritePageIds: Set<number>;
  onFavoriteToggle: (pageId: number) => void;
  onArticleClick: (url: string) => void;
}

function buildColumns(
  readPageIds: Set<number>,
  favoritePageIds: Set<number>,
  onFavoriteToggle: (pageId: number) => void,
  onArticleClick: (url: string) => void
): IColumn[] {
  return [
    {
      key: 'unread',
      name: '',
      iconName: 'StatusCircleInner',
      minWidth: 30,
      maxWidth: 30,
      onRender: (item: IArticlePage) => {
        if (!readPageIds.has(item.id)) {
          return (
            <span className={styles.unreadDot} />
          );
        }
        return undefined;
      },
    },
    {
      key: 'favorite',
      name: '',
      iconName: 'FavoriteStar',
      minWidth: 30,
      maxWidth: 30,
      onRender: (item: IArticlePage) => {
        const isFav = favoritePageIds.has(item.id);
        return (
          <button
            className={`${styles.favoriteButton}${isFav ? ` ${styles.favorited}` : ''}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onFavoriteToggle(item.id);
            }}
            aria-label={isFav ? sharedStrings.RemoveFavorite : sharedStrings.AddFavorite}
            type="button"
          >
            <Icon iconName={isFav ? 'FavoriteStarFill' : 'FavoriteStar'} />
          </button>
        );
      },
    },
    {
      key: 'title',
      name: strings.ColumnTitle,
      fieldName: 'title',
      minWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onRender: (item: IArticlePage) => (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => onArticleClick(item.url)}
        >
          {item.title}
        </span>
      ),
    },
    {
      key: 'category',
      name: strings.ColumnCategory,
      fieldName: 'category',
      minWidth: 120,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onRender: (item: IArticlePage) => (
        <span
          className={styles.categoryBadge}
          style={{ backgroundColor: getCategoryColor(item.category) }}
        >
          {item.category}
        </span>
      ),
    },
    {
      key: 'author',
      name: strings.ColumnAuthor,
      fieldName: 'author',
      minWidth: 120,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onRender: (item: IArticlePage) => (
        <span>{item.author.displayName}</span>
      ),
    },
    {
      key: 'modified',
      name: strings.ColumnModified,
      fieldName: 'modifiedDate',
      minWidth: 100,
      isResizable: true,
      isSorted: true,
      isSortedDescending: true,
      onRender: (item: IArticlePage) => (
        <span>{formatRelativeDate(item.modifiedDate)}</span>
      ),
    },
    {
      key: 'mandatory',
      name: '',
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: IArticlePage) => {
        if (item.isMandatory) {
          return <span className={styles.mandatoryBadge}>{sharedStrings.MandatoryArticle}</span>;
        }
        return undefined;
      },
    },
  ];
}

function sortItems(items: IArticlePage[], columnKey: string, descending: boolean): IArticlePage[] {
  return [...items].sort((a: IArticlePage, b: IArticlePage) => {
    let valA: string | number | Date;
    let valB: string | number | Date;

    switch (columnKey) {
      case 'title':
        valA = a.title;
        valB = b.title;
        break;
      case 'category':
        valA = a.category;
        valB = b.category;
        break;
      case 'author':
        valA = a.author.displayName;
        valB = b.author.displayName;
        break;
      case 'modified':
        valA = a.modifiedDate.getTime();
        valB = b.modifiedDate.getTime();
        break;
      default:
        return 0;
    }

    if (valA < valB) return descending ? 1 : -1;
    if (valA > valB) return descending ? -1 : 1;
    return 0;
  });
}

export const ArticleListView: React.FunctionComponent<IArticleListViewProps> = ({
  articles,
  readPageIds,
  favoritePageIds,
  onFavoriteToggle,
  onArticleClick,
}) => {
  const [columns, setColumns] = React.useState<IColumn[]>(
    buildColumns(readPageIds, favoritePageIds, onFavoriteToggle, onArticleClick)
  );
  const [sortedItems, setSortedItems] = React.useState<IArticlePage[]>(
    sortItems(articles, 'modified', true)
  );

  // Sync when articles or deps change
  React.useEffect(() => {
    const newColumns = buildColumns(readPageIds, favoritePageIds, onFavoriteToggle, onArticleClick);
    // Preserve existing sort state
    const currentSorted = columns.find(c => c.isSorted);
    if (currentSorted) {
      const updated = newColumns.map(c => ({
        ...c,
        isSorted: c.key === currentSorted.key,
        isSortedDescending: c.key === currentSorted.key ? currentSorted.isSortedDescending : false,
      }));
      setColumns(updated);
      setSortedItems(
        sortItems(articles, currentSorted.key, !!currentSorted.isSortedDescending)
      );
    } else {
      setColumns(newColumns);
      setSortedItems(sortItems(articles, 'modified', true));
    }
  }, [articles, readPageIds, favoritePageIds, onFavoriteToggle, onArticleClick]);

  const onColumnClick = React.useCallback(
    (_ev?: React.MouseEvent<HTMLElement>, column?: IColumn): void => {
      if (!column) return;
      // Only sortable columns
      if (column.key === 'unread' || column.key === 'favorite' || column.key === 'mandatory') {
        return;
      }

      const newDescending = column.isSorted ? !column.isSortedDescending : true;

      setColumns(prev =>
        prev.map(c => ({
          ...c,
          isSorted: c.key === column.key,
          isSortedDescending: c.key === column.key ? newDescending : false,
        }))
      );

      setSortedItems(prev => sortItems(prev, column.key, newDescending));
    },
    []
  );

  const onActiveItemChanged = React.useCallback(
    (item?: IArticlePage): void => {
      if (item) {
        onArticleClick(item.url);
      }
    },
    [onArticleClick]
  );

  return (
    <div className={styles.listView}>
      <DetailsList
        items={sortedItems}
        columns={columns}
        selectionMode={SelectionMode.none}
        onColumnHeaderClick={onColumnClick}
        onActiveItemChanged={onActiveItemChanged}
        compact={true}
      />
    </div>
  );
};
