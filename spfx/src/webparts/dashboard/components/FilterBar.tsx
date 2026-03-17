import * as React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import { RoleGate } from '../../../shared/components/RoleGate';
import { useWissensHub } from '../../../shared/context';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import styles from './Dashboard.module.scss';
import * as strings from 'DashboardWebPartStrings';
import * as sharedStrings from 'SharedStrings';

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

function getStatusLabels(): Record<string, string> {
  return {
    'Draft': sharedStrings.StatusDraft,
    'InReview': sharedStrings.StatusInReview,
    'Published': sharedStrings.StatusPublished,
    'Archived': sharedStrings.StatusArchived,
  };
}

function getStatusOptions(): IDropdownOption[] {
  return [
    { key: '', text: sharedStrings.AllFilter },
    { key: 'Draft', text: sharedStrings.StatusDraft },
    { key: 'InReview', text: sharedStrings.StatusInReview },
    { key: 'Published', text: sharedStrings.StatusPublished },
    { key: 'Archived', text: sharedStrings.StatusArchived },
  ];
}

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

  const { services } = useWissensHub();

  // Track search_executed telemetry event on debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      services.telemetry.trackEvent('search_executed', {
        query: debouncedSearch.trim(),
        source: 'dashboard'
      });
    }
  }, [debouncedSearch, services.telemetry]);

  const statusLabels = getStatusLabels();
  const statusOptions = getStatusOptions();

  const categoryOptions: IDropdownOption[] = React.useMemo(() => [
    { key: '', text: sharedStrings.AllFilter },
    ...categories.map(c => ({ key: c, text: c })),
  ], [categories]);

  const targetGroupOptions: IDropdownOption[] = React.useMemo(() => [
    { key: '', text: sharedStrings.AllFilter },
    ...targetGroups.map(g => ({ key: g, text: g })),
  ], [targetGroups]);

  const hasActiveFilters = categoryFilter !== '' || statusFilter !== '' || targetGroupFilter !== '';

  const activePills: Array<{ label: string; value: string; onClear: () => void }> = [];
  if (categoryFilter) {
    activePills.push({
      label: sharedStrings.Category,
      value: categoryFilter,
      onClear: () => onCategoryChange(''),
    });
  }
  if (statusFilter) {
    activePills.push({
      label: sharedStrings.Status,
      value: statusLabels[statusFilter] || statusFilter,
      onClear: () => onStatusChange(''),
    });
  }
  if (targetGroupFilter) {
    activePills.push({
      label: sharedStrings.TargetGroup,
      value: targetGroupFilter,
      onClear: () => onTargetGroupChange(''),
    });
  }

  return (
    <div className={styles.filterBar}>
      {/* Row 1: Search + Dropdowns + View Toggle */}
      <div className={styles.filterRow}>
        <SearchBox
          placeholder={strings.SearchPlaceholder}
          value={searchQuery}
          onChange={(_ev, newValue) => onSearchChange(newValue || '')}
          onClear={() => onSearchChange('')}
          styles={{ root: { width: 250 } }}
        />
        <Dropdown
          placeholder={strings.CategoryPlaceholder}
          options={categoryOptions}
          selectedKey={categoryFilter}
          onChange={(_ev, option) => onCategoryChange((option?.key as string) || '')}
          styles={{ root: { width: 160 } }}
        />
        <Dropdown
          placeholder={strings.StatusPlaceholder}
          options={statusOptions}
          selectedKey={statusFilter}
          onChange={(_ev, option) => onStatusChange((option?.key as string) || '')}
          styles={{ root: { width: 160 } }}
        />
        <Dropdown
          placeholder={strings.TargetGroupPlaceholder}
          options={targetGroupOptions}
          selectedKey={targetGroupFilter}
          onChange={(_ev, option) => onTargetGroupChange((option?.key as string) || '')}
          styles={{ root: { width: 160 } }}
        />
        <div className={styles.viewToggle}>
          <IconButton
            iconProps={{ iconName: 'GridViewMedium' }}
            title={strings.CardView}
            ariaLabel={strings.CardView}
            className={`${styles.viewToggleButton} ${viewMode === 'card' ? styles.viewToggleActive : ''}`}
            onClick={() => onViewModeChange('card')}
          />
          <IconButton
            iconProps={{ iconName: 'List' }}
            title={strings.ListView}
            ariaLabel={strings.ListView}
            className={`${styles.viewToggleButton} ${viewMode === 'list' ? styles.viewToggleActive : ''}`}
            onClick={() => onViewModeChange('list')}
          />
        </div>
        <RoleGate minimumRole="editor">
          <PrimaryButton
            text={strings.NewArticle}
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
                aria-label={strings.RemoveFilterLabel.replace('{0}', pill.label)}
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
            {strings.ClearFilters}
          </button>
        </div>
      )}
    </div>
  );
};
