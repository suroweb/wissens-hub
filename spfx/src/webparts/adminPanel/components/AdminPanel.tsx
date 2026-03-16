import * as React from 'react';
import styles from './AdminPanel.module.scss';
import type { IAdminPanelProps } from './IAdminPanelProps';
import { Icon } from '@fluentui/react/lib/Icon';
import { useWissensHub } from '../../../shared/context';

const AdminPanel: React.FunctionComponent<IAdminPanelProps> = (props) => {
  const { description, hasTeamsContext } = props;
  const { role, currentUser, isLoading } = useWissensHub();

  if (isLoading) return null;

  return (
    <section className={`${styles.adminPanel} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="Settings" className={styles.icon} />
        <h2>Admin Panel</h2>
      </div>
      <p>{description}</p>
      <div className={styles.userInfo}>
        <Icon iconName="Contact" />
        <span>{currentUser.displayName} ({role})</span>
      </div>
    </section>
  );
};

export default AdminPanel;
