import * as React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import { RoleGate } from '../../../shared/components/RoleGate';
import styles from './Dashboard.module.scss';

export interface IFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  targetGroupFilter: string;
  onTargetGroupChange: (targetGroup: string) => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  categories: string[];
  targetGroups: string[];
  onClearAllFilters: () => void;
  siteUrl?: string;
}

const STATUS_LABELS: Record<string, string> = {
  'Draft': 'Entwurf',
  'InReview': 'In Prüfung',
  'Published': 'Veröffentlicht',
  'Archived': 'Archiviert',
};

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: '', text: 'Alle' },
  { key: 'Draft', text: 'Entwurf' },
  { key: 'InReview', text: 'In Prüfung' },
  { key: 'Published', text: 'Veröffentlicht' },
  { key: 'Archived', text: 'Archiviert' },
];

export const FilterBar: React.FunctionComponent<IFilterBarProps> = (props) => {
  const {
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    statusFilter,
    onStatusChange,
    targetGroupFilter,
    onTargetGroupChange,
    viewMode,
    onViewModeChange,
    categories,
    targetGroups,
    onClearAllFilters,
  } = props;

  const categoryOptions: IDropdownOption[] = React.useMemo(() => [
    { key: '', text: 'Alle' },
    ...categories.map(c => ({ key: c, text: c })),
  ], [categories]);

  const targetGroupOptions: IDropdownOption[] = React.useMemo(() => [
    { key: '', text: 'Alle' },
    ...targetGroups.map(g => ({ key: g, text: g })),
  ], [targetGroups]);

  const hasActiveFilters = categoryFilter !== '' || statusFilter !== '' || targetGroupFilter !== '';

  const activePills: Array<{ label: string; value: string; onClear: () => void }> = [];
  if (categoryFilter) {
    activePills.push({
      label: 'Kategorie',
      value: categoryFilter,
      onClear: () => onCategoryChange(''),
    });
  }
  if (statusFilter) {
    activePills.push({
      label: 'Status',
      value: STATUS_LABELS[statusFilter] || statusFilter,
      onClear: () => onStatusChange(''),
    });
  }
  if (targetGroupFilter) {
    activePills.push({
      label: 'Zielgruppe',
      value: targetGroupFilter,
      onClear: () => onTargetGroupChange(''),
    });
  }

  return (
    <div className={styles.filterBar}>
      {/* Row 1: Search + Dropdowns + View Toggle */}
      <div className={styles.filterRow}>
        <SearchBox
          placeholder="Artikel suchen..."
          value={searchQuery}
          onChange={(_ev, newValue) => onSearchChange(newValue || '')}
          onClear={() => onSearchChange('')}
          styles={{ root: { width: 250 } }}
        />
        <Dropdown
          placeholder="Kategorie"
          options={categoryOptions}
          selectedKey={categoryFilter}
          onChange={(_ev, option) => onCategoryChange((option?.key as string) || '')}
          styles={{ root: { width: 160 } }}
        />
        <Dropdown
          placeholder="Status"
          options={STATUS_OPTIONS}
          selectedKey={statusFilter}
          onChange={(_ev, option) => onStatusChange((option?.key as string) || '')}
          styles={{ root: { width: 160 } }}
        />
        <Dropdown
          placeholder="Zielgruppe"
          options={targetGroupOptions}
          selectedKey={targetGroupFilter}
          onChange={(_ev, option) => onTargetGroupChange((option?.key as string) || '')}
          styles={{ root: { width: 160 } }}
        />
        <div className={styles.viewToggle}>
          <IconButton
            iconProps={{ iconName: 'GridViewMedium' }}
            title="Kartenansicht"
            ariaLabel="Kartenansicht"
            className={`${styles.viewToggleButton} ${viewMode === 'card' ? styles.viewToggleActive : ''}`}
            onClick={() => onViewModeChange('card')}
          />
          <IconButton
            iconProps={{ iconName: 'List' }}
            title="Listenansicht"
            ariaLabel="Listenansicht"
            className={`${styles.viewToggleButton} ${viewMode === 'list' ? styles.viewToggleActive : ''}`}
            onClick={() => onViewModeChange('list')}
          />
        </div>
        <RoleGate minimumRole="editor">
          <PrimaryButton
            text="Neuer Artikel"
            iconProps={{ iconName: 'Add' }}
            onClick={() => {
              const baseUrl = props.siteUrl || '/sites/wissenshub';
              window.location.href = `${baseUrl}/_layouts/15/CreatePage.aspx`;
            }}
            className={styles.newArticleButton}
          />
        </RoleGate>
      </div>

      {/* Row 2: Active filter pills */}
      {hasActiveFilters && (
        <div className={styles.filterPills}>
          {activePills.map(pill => (
            <span key={`${pill.label}-${pill.value}`} className={styles.filterPill}>
              <Icon iconName="Tag" style={{ fontSize: 10, marginRight: 4 }} />
              {pill.value}
              <button
                className={styles.filterPillRemove}
                onClick={pill.onClear}
                type="button"
                aria-label={`${pill.label} Filter entfernen`}
              >
                x
              </button>
            </span>
          ))}
          <button
            className={styles.clearFiltersLink}
            onClick={onClearAllFilters}
            type="button"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
};
