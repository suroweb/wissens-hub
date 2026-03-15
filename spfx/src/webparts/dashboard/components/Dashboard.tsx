import * as React from 'react';
import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
import { AadHttpClient } from '@microsoft/sp-http';
import { Icon } from '@fluentui/react/lib/Icon';

const Dashboard: React.FunctionComponent<IDashboardProps> = (props) => {
  const { description, hasTeamsContext, httpClient, apiBaseUrl } = props;
  const [healthStatus, setHealthStatus] = React.useState<string>('');

  React.useEffect(() => {
    if (!httpClient || !apiBaseUrl) return;

    httpClient
      .get(`${apiBaseUrl}/api/health`, AadHttpClient.configurations.v1)
      .then(response => response.json())
      .then(data => setHealthStatus(`API: ${data.status} (${data.timestamp})`))
      .catch(err => setHealthStatus(`API Error: ${err.message}`));
  }, [httpClient, apiBaseUrl]);

  return (
    <section className={`${styles.dashboard} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="ViewDashboard" className={styles.icon} />
        <h2>Dashboard</h2>
      </div>
      <p>{description}</p>
      {healthStatus ? (
        <div className={styles.healthStatus}>
          <Icon iconName="PlugConnected" />
          <span>{healthStatus}</span>
        </div>
      ) : (
        !httpClient && (
          <div className={styles.healthStatus}>
            <Icon iconName="PlugDisconnected" />
            <span>API connection: Not available (workbench mode)</span>
          </div>
        )
      )}
    </section>
  );
};

export default Dashboard;
