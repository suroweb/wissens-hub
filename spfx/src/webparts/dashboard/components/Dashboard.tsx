import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { Icon } from '@fluentui/react/lib/Icon';
import { useWissensHub } from '../../../shared/context';

const Dashboard: React.FunctionComponent<IDashboardProps> = (props) => {
  const { description, hasTeamsContext } = props;
  const { role, currentUser, isLoading } = useWissensHub();

  if (isLoading) return null;

  return (
    <section className={`${styles.dashboard} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="ViewDashboard" className={styles.icon} />
        <h2>Dashboard</h2>
      </div>
      <p>{description}</p>
      <div className={styles.healthStatus}>
        <Icon iconName="Contact" />
        <span>{currentUser.displayName} ({role})</span>
      </div>
    </section>
  );
};

export default Dashboard;
