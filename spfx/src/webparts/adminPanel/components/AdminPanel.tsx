import * as React from 'react';
import styles from './AdminPanel.module.scss';
import type { IAdminPanelProps } from './IAdminPanelProps';
import { Icon } from '@fluentui/react/lib/Icon';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { RoleGate } from '../../../shared/components/RoleGate';
import { useWissensHub } from '../../../shared/context';
import { UebersichtTab } from './UebersichtTab';
import { KategorienTab } from './KategorienTab';
import { ZielgruppenTab } from './ZielgruppenTab';
import { BerichteTab } from './BerichteTab';
import * as strings from 'AdminPanelWebPartStrings';

const AdminPanel: React.FunctionComponent<IAdminPanelProps> = (props) => {
  const { hasTeamsContext } = props;
  const { isLoading } = useWissensHub();

  if (isLoading) return React.createElement('div', { 'data-automationid': 'admin-panel-loading' });

  const sectionContent = React.createElement('section', {
    className: styles.adminPanel + (hasTeamsContext ? ' ' + styles.teams : ''),
  },
    React.createElement('div', { className: styles.header },
      React.createElement(Icon, { iconName: 'Settings', className: styles.icon }),
      React.createElement('h2', undefined, strings.AdminPanelTitle),
    ),
    React.createElement(Pivot, { defaultSelectedKey: 'uebersicht' },
      React.createElement(PivotItem, { headerText: strings.TabOverview, itemKey: 'uebersicht', itemIcon: 'ViewDashboard' },
        React.createElement(UebersichtTab, undefined),
      ),
      React.createElement(PivotItem, { headerText: strings.TabCategories, itemKey: 'kategorien', itemIcon: 'Tag' },
        React.createElement(KategorienTab, undefined),
      ),
      React.createElement(PivotItem, { headerText: strings.TabTargetGroups, itemKey: 'zielgruppen', itemIcon: 'Group' },
        React.createElement(ZielgruppenTab, undefined),
      ),
      React.createElement(PivotItem, { headerText: strings.TabReports, itemKey: 'berichte', itemIcon: 'ReportDocument' },
        React.createElement(BerichteTab, undefined),
      ),
    ),
  );

  return React.createElement(RoleGate, { minimumRole: 'admin', children: sectionContent });
};

export default AdminPanel;
