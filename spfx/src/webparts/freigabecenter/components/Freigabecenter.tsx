import * as React from 'react';
import styles from './Freigabecenter.module.scss';
import type { IFreigabecenterProps } from './IFreigabecenterProps';
import { Icon } from '@fluentui/react/lib/Icon';
import { useWissensHub } from '../../../shared/context';

const Freigabecenter: React.FunctionComponent<IFreigabecenterProps> = (props) => {
  const { description, hasTeamsContext } = props;
  const { role, currentUser, isLoading } = useWissensHub();

  if (isLoading) return null;

  return (
    <section className={`${styles.freigabecenter} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="Approve" className={styles.icon} />
        <h2>Freigabecenter</h2>
      </div>
      <p>{description}</p>
      <div className={styles.userInfo}>
        <Icon iconName="Contact" />
        <span>{currentUser.displayName} ({role})</span>
      </div>
    </section>
  );
};

export default Freigabecenter;
