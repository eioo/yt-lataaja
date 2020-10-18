import React, { Suspense } from 'react';
import type { VideoDetails as VideoDetailsType } from 'shared/youtube';
import styles from './videoDetails.module.scss';
const VideoPlayer = React.lazy(() => import('../VideoPlayer'));

interface VideoDetailsProps {
  videoDetails?: VideoDetailsType;
  downloadInProgress: boolean;
  onTimeChange: (seconds: number) => void;
}

function VideoDetails({
  videoDetails,
  downloadInProgress,
  onTimeChange,
}: VideoDetailsProps) {
  if (!videoDetails) {
    return null;
  }

  return (
    <section
      className={`${styles.videoDetails} ${
        downloadInProgress ? styles.rounded : ''
      }`}
    >
      <Suspense fallback={null}>
        <VideoPlayer
          videoId={videoDetails?.videoId}
          onTimeChange={onTimeChange}
        />
      </Suspense>
      <h1>{videoDetails.title}</h1>
    </section>
  );
}

export default VideoDetails;
