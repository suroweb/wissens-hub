import * as React from 'react';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import styles from './ShimmerCard.module.scss';

export interface IShimmerCardProps {
  width?: string;
}

export const ShimmerCard: React.FC<IShimmerCardProps> = ({ width }) => {
  return (
    <div className={styles.shimmerCard} style={width ? { width } : undefined}>
      <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '60%', height: 14 }]} />
      <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '90%', height: 20 }]} />
      <Shimmer shimmerElements={[{ type: ShimmerElementType.line, width: '40%', height: 14 }]} />
    </div>
  );
};
