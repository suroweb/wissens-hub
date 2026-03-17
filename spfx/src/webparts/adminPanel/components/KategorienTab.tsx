import * as React from 'react';
import { DetailsList, IColumn, SelectionMode, Selection, IObjectWithKey } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { IconButton } from '@fluentui/react/lib/Button';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Shimmer } from '@fluentui/react/lib/Shimmer';
import { useCategoriesQuery } from '../../../shared/hooks/queries';
import { useSaveCategoryCommand, useDeleteCategoryCommand } from '../../../shared/hooks/commands';
import { ICategory } from '../../../shared/interfaces/IAdminService';
import styles from './AdminPanel.module.scss';

interface IEditableCategory extends ICategory {
  isNew?: boolean;
}

export const KategorienTab: React.FunctionComponent = () => {
  const categoriesQuery = useCategoriesQuery();
  const saveCommand = useSaveCategoryCommand();
  const deleteCommand = useDeleteCategoryCommand();

  const [editingId, setEditingId] = React.useState<number | undefined>(undefined);
  const [editName, setEditName] = React.useState<string>('');
  const [editDescription, setEditDescription] = React.useState<string>('');
  const [addingNew, setAddingNew] = React.useState<boolean>(false);
  const [newName, setNewName] = React.useState<string>('');
  const [newDescription, setNewDescription] = React.useState<string>('');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const categories: ICategory[] = categoriesQuery.state.status === 'success'
    ? categoriesQuery.state.data : [];

  const selectionRef = React.useRef<Selection<IObjectWithKey>>(new Selection<IObjectWithKey>({
    onSelectionChanged: () => {
      const sel = selectionRef.current.getSelection() as unknown as IEditableCategory[];
      const ids: number[] = [];
      for (let i = 0; i < sel.length; i++) {
        if (!sel[i].isNew) {
          ids.push(sel[i].id);
        }
      }
      setSelectedIds(ids);
    },
    getKey: (item: IObjectWithKey) => String((item as unknown as IEditableCategory).id),
  }));

  const handleStartEdit = React.useCallback((item: ICategory): void => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
  }, []);

  const handleSaveEdit = React.useCallback(async (): Promise<void> => {
    if (editingId === undefined) return;
    setErrorMessage('');
    const success = await saveCommand.execute(editName, editDescription, editingId);
    if (success) {
      setEditingId(undefined);
      categoriesQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Speichern der Kategorie.');
    }
  }, [editingId, editName, editDescription, saveCommand, categoriesQuery]);

  const handleCancelEdit = React.useCallback((): void => {
    setEditingId(undefined);
  }, []);

  const handleToggleActive = React.useCallback(async (item: ICategory, checked: boolean): Promise<void> => {
    setErrorMessage('');
    const success = await saveCommand.execute(item.name, item.description, item.id, checked);
    if (success) {
      categoriesQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Aktualisieren des Status.');
    }
  }, [saveCommand, categoriesQuery]);

  const handleAddNew = React.useCallback(async (): Promise<void> => {
    if (!newName.trim()) return;
    setErrorMessage('');
    const success = await saveCommand.execute(newName.trim(), newDescription.trim());
    if (success) {
      setAddingNew(false);
      setNewName('');
      setNewDescription('');
      categoriesQuery.refetch();
    } else {
      setErrorMessage('Fehler beim Erstellen der Kategorie.');
    }
  }, [newName, newDescription, saveCommand, categoriesQuery]);

  const handleDeleteSelected = React.useCallback(async (): Promise<void> => {
    setErrorMessage('');
    for (let i = 0; i < selectedIds.length; i++) {
      const success = await deleteCommand.execute(selectedIds[i]);
      if (!success) {
        setErrorMessage('Fehler beim Loeschen einer Kategorie.');
      }
    }
    setSelectedIds([]);
    categoriesQuery.refetch();
  }, [selectedIds, deleteCommand, categoriesQuery]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Hinzufugen',
      iconProps: { iconName: 'Add' },
      onClick: () => setAddingNew(true),
    },
    {
      key: 'delete',
      text: 'Loschen',
      iconProps: { iconName: 'Delete' },
      disabled: selectedIds.length === 0,
      onClick: () => { handleDeleteSelected().catch(() => { /* handled */ }); },
    },
  ];

  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true,
      onRender: (item: IEditableCategory) => {
        if (item.isNew) {
          return React.createElement(TextField, {
            value: newName,
            onChange: (_: React.FormEvent<HTMLElement>, val?: string) => setNewName(val || ''),
            placeholder: 'Kategorie-Name',
          });
        }
        if (editingId === item.id) {
          return React.createElement(TextField, {
            value: editName,
            onChange: (_: React.FormEvent<HTMLElement>, val?: string) => setEditName(val || ''),
          });
        }
        return React.createElement('span', {
          style: { cursor: 'pointer' },
          onClick: () => handleStartEdit(item),
        }, item.name);
      },
    },
    {
      key: 'description',
      name: 'Beschreibung',
      fieldName: 'description',
      minWidth: 200,
      maxWidth: 350,
      isResizable: true,
      onRender: (item: IEditableCategory) => {
        if (item.isNew) {
          return React.createElement(TextField, {
            value: newDescription,
            onChange: (_: React.FormEvent<HTMLElement>, val?: string) => setNewDescription(val || ''),
            placeholder: 'Beschreibung',
          });
        }
        if (editingId === item.id) {
          return React.createElement(TextField, {
            value: editDescription,
            onChange: (_: React.FormEvent<HTMLElement>, val?: string) => setEditDescription(val || ''),
          });
        }
        return React.createElement('span', undefined, item.description);
      },
    },
    {
      key: 'isActive',
      name: 'Aktiv',
      minWidth: 60,
      maxWidth: 80,
      onRender: (item: IEditableCategory) => {
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
      onRender: (item: IEditableCategory) => {
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
              onClick: () => { setAddingNew(false); setNewName(''); setNewDescription(''); },
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
        return React.createElement(IconButton, {
          iconProps: { iconName: 'Edit' },
          title: 'Bearbeiten',
          onClick: () => handleStartEdit(item),
        });
      },
    },
  ];

  // Build items list
  const items: IEditableCategory[] = categories.slice();
  if (addingNew) {
    items.push({
      id: -1,
      name: '',
      description: '',
      isActive: true,
      isNew: true,
    });
  }

  if (categoriesQuery.state.status === 'loading' || categoriesQuery.state.status === 'idle') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
      React.createElement(Shimmer, undefined),
    );
  }

  if (categoriesQuery.state.status === 'error') {
    return React.createElement('div', { className: styles.tabContent },
      React.createElement(MessageBar, { messageBarType: MessageBarType.error },
        'Fehler beim Laden der Kategorien.',
      ),
    );
  }

  return React.createElement('div', { className: styles.tabContent },
    errorMessage ? React.createElement(MessageBar, {
      messageBarType: MessageBarType.error,
      onDismiss: () => setErrorMessage(''),
    }, errorMessage) : undefined,
    React.createElement('div', { className: styles.commandBarContainer },
      React.createElement(CommandBar, { items: commandBarItems }),
    ),
    React.createElement(DetailsList, {
      items: items,
      columns: columns,
      selectionMode: SelectionMode.multiple,
      selection: selectionRef.current,
      getKey: (item: IEditableCategory) => String(item.id),
    }),
  );
};
