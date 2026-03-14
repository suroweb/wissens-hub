import * as React from 'react';
import styles from './Freigabecenter.module.scss';
import type { IFreigabecenterProps } from './IFreigabecenterProps';
import { Icon } from '@fluentui/react/lib/Icon';

const Freigabecenter: React.FunctionComponent<IFreigabecenterProps> = (props) => {
  const { description, hasTeamsContext } = props;

  return (
    <section className={`${styles.freigabecenter} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="Approve" className={styles.icon} />
        <h2>Freigabecenter</h2>
      </div>
      <p>{description}</p>
    </section>
  );
};

export default Freigabecenter;
