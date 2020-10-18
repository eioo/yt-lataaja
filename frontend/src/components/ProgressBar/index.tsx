import React from 'react';
import styles from './progressBar.module.scss';

export interface ProgressBarProps {
  value: number | undefined;
}

function ProgressBar(props: ProgressBarProps) {
  if (props.value === undefined) {
    return null;
  }

  const value = Math.min(Math.max(0, props.value || 0), 100);

  return (
    <div className={styles.container}>
      <div
        className={styles.progressBar}
        style={{
          width: `${value}%`,
        }}
      >
        {value === 0 ? '' : value === 100 ? 'Done' : value}
      </div>
    </div>
  );
}

export default ProgressBar;
