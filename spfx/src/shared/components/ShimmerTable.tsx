import * as React from 'react';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import styles from './ShimmerTable.module.scss';

export interface IShimmerTableProps {
  rows?: number;
}

export const ShimmerTable: React.FC<IShimmerTableProps> = ({ rows = 5 }) => {
  const shimmerRows: React.ReactElement[] = [];
  const widths = ['90%', '70%', '80%', '60%', '75%'];

  for (let i = 0; i < rows; i++) {
    shimmerRows.push(
      <div key={i} className={styles.shimmerRow}>
        <Shimmer shimmerElements={[
          { type: ShimmerElementType.line, width: widths[i % widths.length], height: 16 },
        ]} />
      </div>
    );
  }

  return <div>{shimmerRows}</div>;
};
