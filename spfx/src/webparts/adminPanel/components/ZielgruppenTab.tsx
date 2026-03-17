import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IconButton } from '@fluentui/react/lib/Button';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer } from '@fluentui/react/lib/Shimmer';
import { useTargetGroupsQuery } from '../../../shared/hooks/queries';
import { useSaveTargetGroupCommand, useDeleteTargetGroupCommand } from '../../../shared/hooks/commands';
import { ITargetGroupConfig } from '../../../shared/interfaces/IAdminService';
import { getSP } from '../../../shared/context/pnpSetup';
import '@pnp/sp/site-groups/web';
import styles from './AdminPanel.module.scss';

interface IEditableTargetGroup extends ITargetGroupConfig {
  isNew?: boolean;
}

interface ISPGroupInfo {
  Title: string;
}

export const ZielgruppenTab: React.FunctionComponent = () => {
  const targetGroupsQuery = useTargetGroupsQuery();
  const saveCommand = useSaveTargetGroupCommand();
  const deleteCommand = useDeleteTargetGroupCommand();

  const [editingId, setEditingId] = React.useState<number | undefined>(undefined);
  const [editName, setEditName] = React.useState<string>('');
  const [addingNew, setAddingNew] = React.useState<boolean>(false);
  const [newName, setNewName] = React.useState<string>('');
  const [newSPGroup, setNewSPGroup] = React.useState<string>('');
  const [spGroups, setSpGroups] = React.useState<ISPGroupInfo[]>([]);
  const [spGroupsLoading, setSpGroupsLoading] = React.useState<boolean>(true);
  const [spGroupsError, setSpGroupsError] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const targetGroups: ITargetGroupConfig[] = targetGroupsQuery.state.status === 'success'
    ? targetGroupsQuery.state.data : [];

  // Fetch SharePoint groups on mount
  React.useEffect(() => {
    const loadGroups = async (): Promise<void> => {
      try {
        const sp = getSP();
        const groups = await sp.web.siteGroups();
        const groupInfos: ISPGroupInfo[] = [];
        for (let i = 0; i < groups.length; i++) {
          groupInfos.push({ Title: (groups[i] as ISPGroupInfo).Title });
        }
        setSpGroups(groupInfos);
        setSpGroupsLoading(false);
      } catch (e) {
        console.warn('Failed to load SP groups:', e);
        setSpGroupsError('SharePoint-Gruppen konnten nicht geladen werden.');
        setSpGroupsLoading(false);
      }
    };
    loadGroups().catch(() => { /* handled */ });
  }, []);

  const spGroupOptions: IDropdownOption[] = React.useMemo(() => {
    const options: IDropdownOption[] = [];
    for (let i = 0; i < spGroups.length; i++) {
      options.push({ key: spGroups[i].Title, text: spGroups[i].Title });
    }
    return options;
  }, [spGroups]);

  const handleStartEdit = React.useCallback((item: ITargetGroupConfig): void => {
    setEditingId(item.id);
    setEditName(item.name);
  }, []);

  const handleSaveEdit = React.useCallback(async (): Promise<void> => {
    if (editingId === undefined) return;
    setErrorMessage('');
    // Find original item for its SP group name
    let spGroupName = '';
    for (let i = 0; i < targetGroups.length; i++) {
      if (targetGroups[i].id === editingId) {
        spGroupName = targetGroups[i].sharePointGroupName;
        break;
      }
    }
    const success = await saveCommand.execute(editName, spGroupName, editingId);
    if (success) {
      setEditingId(undefined);
      targetGroupsQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Speichern der Zielgruppe.');
    }
  }, [editingId, editName, targetGroups, saveCommand, targetGroupsQuery]);

  const handleCancelEdit = React.useCallback((): void => {
    setEditingId(undefined);
  }, []);

  const handleToggleActive = React.useCallback(async (item: ITargetGroupConfig, checked: boolean): Promise<void> => {
    setErrorMessage('');
    const success = await saveCommand.execute(item.name, item.sharePointGroupName, item.id, checked);
    if (success) {
      targetGroupsQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Aktualisieren des Status.');
    }
  }, [saveCommand, targetGroupsQuery]);

  const handleAddNew = React.useCallback(async (): Promise<void> => {
    if (!newName.trim() || !newSPGroup) return;
    setErrorMessage('');
    const success = await saveCommand.execute(newName.trim(), newSPGroup);
    if (success) {
      setAddingNew(false);
      setNewName('');
      setNewSPGroup('');
      targetGroupsQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Erstellen der Zielgruppe.');
    }
  }, [newName, newSPGroup, saveCommand, targetGroupsQuery]);

  const handleDeleteSelected = React.useCallback(async (id: number): Promise<void> => {
    setErrorMessage('');
    const success = await deleteCommand.execute(id);
    if (success) {
      targetGroupsQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Loeschen der Zielgruppe.');
    }
  }, [deleteCommand, targetGroupsQuery]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Hinzufugen',
      iconProps: { iconName: 'Add' },
      onClick: () => setAddingNew(true),
    },
  ];

  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 150,
      isResizable: true,
      onRender: (item: IEditableTargetGroup) => {
        if (item.isNew) {
          return React.createElement(TextField, {
            value: newName,
            onChange: (_: React.FormEvent<HTMLElement>, val?: string) => setNewName(val || ''),
            placeholder: 'Zielgruppen-Name',
          });
        }
        if (editingId === item.id) {
          return React.createElement(TextField, {
            value: editName,
            onChange: (_: React.FormEvent<HTMLElement>, val?: string) => setEditName(val || ''),
          });
        }
        return React.createElement('span', undefined, item.name);
      },
    },
    {
      key: 'spGroup',
      name: 'SharePoint-Gruppe',
      fieldName: 'sharePointGroupName',
      minWidth: 200,
      isResizable: true,
      onRender: (item: IEditableTargetGroup) => {
        if (item.isNew) {
          if (spGroupsLoading) {
            return React.createElement(Shimmer, undefined);
          }
          return React.createElement(Dropdown, {
            placeholder: 'SharePoint-Gruppe wahlen',
            options: spGroupOptions,
            selectedKey: newSPGroup || undefined,
            onChange: (_: React.FormEvent<HTMLElement>, option?: IDropdownOption) => {
              if (option) {
                setNewSPGroup(option.key as string);
                if (!newName.trim()) {
                  setNewName(option.key as string);
                }
              }
            },
          });
        }
        return React.createElement('span', undefined, item.sharePointGroupName);
      },
    },
    {
      key: 'isActive',
      name: 'Aktiv',
      minWidth: 60,
      maxWidth: 80,
      onRender: (item: IEditableTargetGroup) => {
        if (item.isNew) return undefined;
        return React.createElement(Toggle, {
          checked: item.isActive,
          onChange: (_: React.MouseEvent<HTMLElement>, checked?: boolean) => {
            handleToggleActive(item, !!checked).catch(() => { /* handled */ });
          },
        });
      },
    },
    {
      key: 'actions',
      name: 'Aktionen',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item: IEditableTargetGroup) => {
        if (item.isNew) {
          return React.createElement('div', { style: { display: 'flex', gap: '4px' } },
            React.createElement(IconButton, {
              iconProps: { iconName: 'Save' },
              title: 'Speichern',
              onClick: () => { handleAddNew().catch(() => { /* handled */ }); },
            }),
            React.createElement(IconButton, {
              iconProps: { iconName: 'Cancel' },
              title: 'Abbrechen',
              onClick: () => { setAddingNew(false); setNewName(''); setNewSPGroup(''); },
            }),
          );
        }
        if (editingId === item.id) {
          return React.createElement('div', { style: { display: 'flex', gap: '4px' } },
            React.createElement(IconButton, {
              iconProps: { iconName: 'Save' },
              title: 'Speichern',
              onClick: () => { handleSaveEdit().catch(() => { /* handled */ }); },
            }),
            React.createElement(IconButton, {
              iconProps: { iconName: 'Cancel' },
              title: 'Abbrechen',
              onClick: handleCancelEdit,
            }),
          );
        }
        return React.createElement('div', { style: { display: 'flex', gap: '4px' } },
          React.createElement(IconButton, {
            iconProps: { iconName: 'Edit' },
            title: 'Bearbeiten',
            onClick: () => handleStartEdit(item),
          }),
          React.createElement(IconButton, {
            iconProps: { iconName: 'Delete' },
            title: 'Loschen',
            onClick: () => { handleDeleteSelected(item.id).catch(() => { /* handled */ }); },
          }),
        );
      },
    },
  ];

  // Build items list
  const items: IEditableTargetGroup[] = targetGroups.slice();
  if (addingNew) {
    items.push({
      id: -1,
      name: '',
      sharePointGroupName: '',
      isActive: true,
      isNew: true,
    });
  }

  if (targetGroupsQuery.state.status === 'loading' || targetGroupsQuery.state.status === 'idle') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
    );
  }

  if (targetGroupsQuery.state.status === 'error') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(MessageBar, { messageBarType: MessageBarType.error },
        'Fehler beim Laden der Zielgruppen.',
      ),
    );
  }

  return React.createElement('div', { className: styles.tabContent },
    errorMessage ? React.createElement(MessageBar, {
      messageBarType: MessageBarType.error,
      onDismiss: () => setErrorMessage(''),
    }, errorMessage) : undefined,
    spGroupsError ? React.createElement(MessageBar, {
      messageBarType: MessageBarType.warning,
    }, spGroupsError) : undefined,
    React.createElement('div', { className: styles.commandBarContainer },
      React.createElement(CommandBar, { items: commandBarItems }),
    ),
    React.createElement(DetailsList, {
      items: items,
      columns: columns,
      selectionMode: SelectionMode.none,
      getKey: (item: IEditableTargetGroup) => String(item.id),
    }),
  );
};
