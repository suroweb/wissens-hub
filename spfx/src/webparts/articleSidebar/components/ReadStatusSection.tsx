import * as React from 'react';
import { PrimaryButton, DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { useMarkAsReadCommand, useToggleFavoriteCommand } from '../../../shared/hooks/commands';
import { IReadConfirmation } from '../../../shared/models/domain/IReadConfirmation';
import styles from './ArticleSidebar.module.scss';

export interface IReadStatusSectionProps {
  pageId: number;
  isMandatory: boolean;
  readConfirmation: IReadConfirmation | undefined;
  contentVersion: number;
  isFavorited: boolean;
  userFlagDate: Date | undefined;
  onFlagClick: () => void;
  onReadStatusChange: () => void;
}

function formatGermanDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const pad = (n: number): string => n < 10 ? '0' + n : '' + n;
  return pad(day) + '.' + pad(month) + '.' + year;
}

export const ReadStatusSection: React.FC<IReadStatusSectionProps> = ({
  pageId,
  isMandatory,
  readConfirmation,
  contentVersion,
  isFavorited,
  userFlagDate,
  onFlagClick,
  onReadStatusChange,
}) => {
  const [localReadDate, setLocalReadDate] = React.useState<Date | undefined>(
    readConfirmation ? readConfirmation.readDate : undefined
  );
  const markAsRead = useMarkAsReadCommand();
  const toggleFavorite = useToggleFavoriteCommand();
  const [localFavorited, setLocalFavorited] = React.useState<boolean>(isFavorited);

  // Version reset detection using confirmedVersion from readConfirmation
  const confirmedVersion = readConfirmation?.confirmedVersion;
  const needsReconfirmation = localReadDate !== undefined
    && confirmedVersion !== undefined
    && contentVersion > confirmedVersion;
  const isEffectivelyUnread = localReadDate === undefined || needsReconfirmation;

  // Mark-as-read handler (optimistic)
  const handleMarkAsRead = React.useCallback(async () => {
    const previousDate = localReadDate;
    setLocalReadDate(new Date()); // optimistic
    const success = await markAsRead.execute(pageId);
    if (!success) {
      setLocalReadDate(previousDate); // revert
    } else {
      onReadStatusChange();
      // Dispatch cross-component event for Application Customizer unread badge
      document.dispatchEvent(
        new CustomEvent('wissenshub:article-read', {
          detail: { pageId: pageId }
        })
      );
    }
  }, [pageId, markAsRead, localReadDate, onReadStatusChange]);

  // Favorite toggle handler (optimistic)
  const handleFavoriteToggle = React.useCallback(async () => {
    const prev = localFavorited;
    setLocalFavorited(!prev); // optimistic
    const success = await toggleFavorite.execute(pageId);
    if (!success) {
      setLocalFavorited(prev); // revert
    }
  }, [pageId, toggleFavorite, localFavorited]);

  return (
    <div className={styles.readStatusSection}>
      {/* Pflichtartikel badge */}
      {isMandatory && isEffectivelyUnread && (
        <MessageBar messageBarType={MessageBarType.severeWarning} className={styles.pflichtartikelBadge}>
          Pflichtartikel - Lesebestatigung erforderlich
        </MessageBar>
      )}

      {/* Version reset warning banner */}
      {needsReconfirmation && (
        <MessageBar messageBarType={MessageBarType.warning} className={styles.resetWarning}>
          Dieser Artikel wurde aktualisiert. Bitte erneut bestatigen.
          <span className={styles.strikethrough}>
            Zuvor gelesen am {formatGermanDate(readConfirmation!.readDate)}
          </span>
        </MessageBar>
      )}

      {/* Mark-as-read / read status display */}
      {isEffectivelyUnread ? (
        <PrimaryButton
          text={needsReconfirmation ? 'Erneut bestatigen' : 'Als gelesen markieren'}
          iconProps={{ iconName: 'CheckMark' }}
          onClick={handleMarkAsRead}
          disabled={markAsRead.state.status === 'executing'}
          className={styles.markAsReadButton}
        />
      ) : (
        <div className={styles.readConfirmed}>
          <Icon iconName="CheckMark" className={styles.readCheckIcon} />
          <span>Gelesen am {formatGermanDate(localReadDate!)}</span>
        </div>
      )}

      {/* Actions row */}
      <div className={styles.actionsRow}>
        {/* Flag button */}
        {userFlagDate ? (
          <DefaultButton
            text={'Gemeldet am ' + formatGermanDate(userFlagDate)}
            iconProps={{ iconName: 'Flag' }}
            disabled={true}
            className={styles.actionButton}
          />
        ) : (
          <DefaultButton
            text="Als veraltet melden"
            iconProps={{ iconName: 'Flag' }}
            onClick={onFlagClick}
            className={styles.actionButton}
          />
        )}

        {/* Favorite star */}
        <IconButton
          iconProps={{ iconName: localFavorited ? 'FavoriteStarFill' : 'FavoriteStar' }}
          title={localFavorited ? 'Favorit entfernen' : 'Als Favorit markieren'}
          onClick={handleFavoriteToggle}
          className={localFavorited ? styles.favoritedStar : styles.unfavoritedStar}
        />
      </div>
    </div>
  );
};
