import * as React from 'react';
import styles from './ArticleSidebar.module.scss';

interface IHeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function extractHeadings(): IHeadingItem[] {
  const elements = document.querySelectorAll('.CanvasZone h2, .CanvasZone h3');
  const items: IHeadingItem[] = [];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (!el.id) {
      el.id = 'toc-heading-' + i;
    }
    items.push({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    });
  }
  return items;
}

export const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = React.useState<IHeadingItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = React.useState<string>('');

  // Heading extraction on mount with delayed retry for late-rendering content
  React.useEffect(() => {
    const result = extractHeadings();
    if (result.length > 0) {
      setHeadings(result);
      return;
    }
    const timer = setTimeout(() => {
      setHeadings(extractHeadings());
    }, 500);
    return () => { clearTimeout(timer); };
  }, []);

  // IntersectionObserver for active section highlighting
  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            setActiveHeadingId(entries[i].target.id);
          }
        }
      },
      { rootMargin: '-10% 0px -85% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => { observer.disconnect(); };
  }, [headings]);

  const handleClick = React.useCallback((headingId: string): void => {
    const el = document.getElementById(headingId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (headings.length === 0) {
    // eslint-disable-next-line @rushstack/no-new-null
    return null as unknown as React.ReactElement;
  }

  return (
    <div className={styles.tocSection}>
      <div className={styles.tocTitle}>Inhaltsverzeichnis</div>
      <ul className={styles.tocList}>
        {headings.map((heading) => {
          let itemClass = styles.tocItem;
          if (heading.level === 3) {
            itemClass += ' ' + styles.tocIndented;
          }
          if (heading.id === activeHeadingId) {
            itemClass += ' ' + styles.tocActive;
          }
          return (
            <li
              key={heading.id}
              className={itemClass}
              onClick={() => handleClick(heading.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(heading.id);
                }
              }}
            >
              {heading.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
