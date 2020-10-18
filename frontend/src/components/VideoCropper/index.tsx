import React, { useMemo } from 'react';
import { secondsToDuration } from 'shared/date';
import styles from './videoCropper.module.scss';

interface VideoCropperProps {
  disabled: boolean;
  cropStart: number | undefined;
  cropEnd: number | undefined;
  onSetCropStart: () => void;
  onSetCropEnd: () => void;
  onReset: () => void;
}

function VideoCropper({
  disabled,
  cropStart,
  cropEnd,
  onSetCropStart,
  onSetCropEnd,
  onReset,
}: VideoCropperProps) {
  const startText = useMemo(() => secondsToDuration(cropStart), [cropStart]);
  const endText = useMemo(() => secondsToDuration(cropEnd), [cropEnd]);

  return (
    <div className={styles.container}>
      <div className={`${styles.flex} ${disabled ? styles.disabled : ''}`}>
        <button
          disabled={disabled}
          className={styles.icon}
          onClick={onSetCropStart}
        />
        <input type="text" value={startText} readOnly />
        -
        <input type="text" value={endText} readOnly />
        <button
          disabled={disabled}
          className={styles.icon}
          onClick={onSetCropEnd}
        />
        <button disabled={disabled} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default VideoCropper;
