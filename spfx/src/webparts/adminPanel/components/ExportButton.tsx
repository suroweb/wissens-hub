import * as React from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';

interface IExportButtonProps {
  onExportCsv: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

export const ExportButton: React.FunctionComponent<IExportButtonProps> = (props) => {
  const { onExportCsv, onExportExcel, disabled } = props;

  const items: ICommandBarItemProps[] = [
    {
      key: 'export',
      text: 'Exportieren',
      iconProps: { iconName: 'Download' },
      disabled: disabled,
      subMenuProps: {
        items: [
          {
            key: 'csv',
            text: 'CSV',
            iconProps: { iconName: 'TextDocument' },
            onClick: () => onExportCsv(),
          },
          {
            key: 'excel',
            text: 'Excel',
            iconProps: { iconName: 'ExcelDocument' },
            onClick: () => onExportExcel(),
          },
        ],
      },
    },
  ];

  return React.createElement(CommandBar, { items: items, styles: { root: { padding: 0 } } });
};
