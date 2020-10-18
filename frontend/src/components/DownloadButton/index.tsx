import React from 'react';
import styles from './downloadButton.module.scss';

interface DownloadButtonProps {
  downloadInProgress: boolean;
  onDownload: () => void;
}

function DownloadButton({
  downloadInProgress,
  onDownload,
}: DownloadButtonProps) {
  if (downloadInProgress) {
    return null;
  }

  return (
    <button
      className={styles.downloadButton}
      disabled={downloadInProgress}
      onClick={() => onDownload()}
    >
      Download
    </button>
  );
}

export default DownloadButton;
