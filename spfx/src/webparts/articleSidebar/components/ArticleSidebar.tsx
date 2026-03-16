import * as React from 'react';
import styles from './ArticleSidebar.module.scss';
import type { IArticleSidebarProps } from './IArticleSidebarProps';
import { Icon } from '@fluentui/react/lib/Icon';
import { useWissensHub } from '../../../shared/context';

const ArticleSidebar: React.FunctionComponent<IArticleSidebarProps> = (props) => {
  const { description, hasTeamsContext } = props;
  const { role, currentUser, isLoading } = useWissensHub();

  if (isLoading) return null;

  return (
    <section className={`${styles.articleSidebar} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="ReadingMode" className={styles.icon} />
        <h2>Article Sidebar</h2>
      </div>
      <p>{description}</p>
      <div className={styles.userInfo}>
        <Icon iconName="Contact" />
        <span>{currentUser.displayName} ({role})</span>
      </div>
    </section>
  );
};

export default ArticleSidebar;
