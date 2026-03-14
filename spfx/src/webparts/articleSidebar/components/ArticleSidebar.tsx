import * as React from 'react';
import styles from './ArticleSidebar.module.scss';
import type { IArticleSidebarProps } from './IArticleSidebarProps';
import { Icon } from '@fluentui/react/lib/Icon';

const ArticleSidebar: React.FunctionComponent<IArticleSidebarProps> = (props) => {
  const { description, hasTeamsContext } = props;

  return (
    <section className={`${styles.articleSidebar} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.header}>
        <Icon iconName="ReadingMode" className={styles.icon} />
        <h2>Article Sidebar</h2>
      </div>
      <p>{description}</p>
    </section>
  );
};

export default ArticleSidebar;
