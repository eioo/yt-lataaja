import React, { useEffect, useState } from 'react';
import { youtubeUrlRegex } from 'shared/youtube';
import styles from './app.module.scss';
import DownloadButton from './components/DownloadButton';
import FileFormatSelect from './components/FileFormatSelect';
import FormatDropdown from './components/FormatDropdown';
import ProgressBar from './components/ProgressBar';
import SearchBar from './components/SearchBar';
import Spinner from './components/Spinner';
import VideoCropper from './components/VideoCropper';
import VideoDetails from './components/VideoDetails';
import { useYoutube } from './useYoutube';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [outputExtension, setOutputExtension] = useState('mp4');
  const [cropStart, setCropStart] = useState<number>();
  const [cropEnd, setCropEnd] = useState<number>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedVideoItag, setSelectedVideoItag] = useState<number>();

  const {
    getVideoInfo,
    videoInfo,
    isSearching,
    isConnected,
    downloadUrl,
    downloadProgress,
    downloadInProgress,
    downloadVideo,
    reset,
  } = useYoutube();
  const { videoDetails } = videoInfo || {};

  useEffect(() => {
    const selected = videoInfo?.formats.find(
      (f) => f?.itag === selectedVideoItag,
    );

    if (selected) {
      setCropStart(0);
      setCropEnd(Number(selected.approxDurationMs) / 1000);
    }
  }, [selectedVideoItag, videoInfo]);

  useEffect(() => {
    if (youtubeUrlRegex.test(videoUrl)) {
      return getVideoInfo(videoUrl);
    }

    if (videoInfo) {
      reset();
    }
  }, [videoUrl]);

  useEffect(() => {
    if (downloadUrl) {
      console.log({ downloadUrl });
      const link = document.createElement('a');
      link.target = '_blank';
      link.href = downloadUrl;
      link.click();
      setTimeout(() => {
        reset();
      }, 1500);
    }
  }, [downloadUrl]);

  const onDownloadButtonClick = () => {
    if (!outputExtension || !selectedVideoItag) {
      return;
    }

    downloadVideo(videoUrl, {
      itag: selectedVideoItag,
      outputExtension,
      cropStart,
      cropEnd,
      audioBitrate: 128,
    });
  };

  if (!isConnected) {
    return <div className={styles.connectingText}>Connecting...</div>;
  }

  return (
    <main>
      <section>
        <SearchBar
          videoUrl={videoUrl}
          onSubmit={getVideoInfo}
          hasSearched={!!videoDetails}
          downloadInProgress={downloadInProgress}
          onChange={setVideoUrl}
        />

        <VideoDetails
          downloadInProgress={downloadInProgress}
          videoDetails={videoDetails}
          onTimeChange={setCurrentTime}
        />
        {videoInfo && (
          <>
            <VideoCropper
              disabled={downloadInProgress}
              cropStart={cropStart}
              cropEnd={cropEnd}
              onSetCropStart={() => {
                setCropStart(currentTime);

                if (currentTime > (cropEnd || 0)) {
                  setCropEnd(currentTime);
                }
              }}
              onSetCropEnd={() => setCropEnd(currentTime)}
              onReset={() => {
                setCropStart(0);
                setCropEnd(
                  Number(
                    videoInfo.formats?.find((f) => f.itag === selectedVideoItag)
                      ?.approxDurationMs || videoDetails?.lengthSeconds,
                  ) / 1000,
                );
              }}
            />
            <FileFormatSelect
              selectedFileType={outputExtension}
              onChange={setOutputExtension}
              disabled={downloadInProgress}
            />
            <FormatDropdown
              disabled={downloadInProgress}
              formats={videoInfo.formats}
              selectedVideoItag={selectedVideoItag}
              onSelectedVideoItagChange={setSelectedVideoItag}
            />
            <DownloadButton
              downloadInProgress={downloadInProgress}
              onDownload={onDownloadButtonClick}
            />
          </>
        )}
      </section>

      {isSearching && <Spinner />}
      <ProgressBar value={downloadProgress} />
      <div className={styles.disclaimer}>
        This site is not affiliated with Google LLC, YouTube or any of their
        family of sites.
      </div>
    </main>
  );
}

export default App;
