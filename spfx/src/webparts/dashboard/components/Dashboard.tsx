import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { Icon } from '@fluentui/react/lib/Icon';

const Dashboard: React.FunctionComponent<IDashboardProps> = (props) => {
  const { description, hasTeamsContext } = props;

  return (
    <section className={`${styles.dashboard} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="ViewDashboard" className={styles.icon} />
        <h2>Dashboard</h2>
      </div>
      <p>{description}</p>
    </section>
  );
};

export default Dashboard;
