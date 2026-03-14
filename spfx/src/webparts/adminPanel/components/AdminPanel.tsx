import * as React from 'react';
import styles from './AdminPanel.module.scss';
import type { IAdminPanelProps } from './IAdminPanelProps';
import { Icon } from '@fluentui/react/lib/Icon';

const AdminPanel: React.FunctionComponent<IAdminPanelProps> = (props) => {
  const { description, hasTeamsContext } = props;

  return (
    <section className={`${styles.adminPanel} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="Settings" className={styles.icon} />
        <h2>Admin Panel</h2>
      </div>
      <p>{description}</p>
    </section>
  );
};

export default AdminPanel;
