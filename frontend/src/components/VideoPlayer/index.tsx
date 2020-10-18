import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import styles from './videoPlayer.module.scss';

interface Player {
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoId?: string;
  onTimeChange?: (seconds: number) => void;
}

function VideoPlayer({ videoId, onTimeChange }: VideoPlayerProps) {
  const [player, setPlayer] = useState<Player>();
  const [currentTime, setCurrentTime] = useState<number>();

  useEffect(() => {
    if (!onTimeChange || !player) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(player.getCurrentTime());
    }, 100);

    return () => clearInterval(timer);
  }, [player, onTimeChange]);

  useEffect(() => {
    if (onTimeChange && currentTime) {
      onTimeChange(currentTime);
    }
  }, [currentTime]);

  if (!videoId) {
    return null;
  }

  return (
    <div>
      <YouTube
        containerClassName={styles.container}
        className={styles.player}
        videoId={videoId}
        onError={() => {
          setPlayer(undefined);
          console.log('error');
        }}
        onReady={(evt) => setPlayer(evt.target)}
      />
    </div>
  );
}

export default VideoPlayer;
