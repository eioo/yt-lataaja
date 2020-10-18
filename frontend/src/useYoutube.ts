import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { DownloadQuery, EventType, WSResponse } from 'shared/websocket';
import type { YtdlVideoInfo } from 'shared/youtube';

function parseMessage(message: string): WSResponse {
  try {
    const [event, data] = JSON.parse(message);

    return {
      event,
      data,
    };
  } catch (e) {
    throw Error('Cant parse incoming WebSocket message');
  }
}

export function getDownloadUrl(relativePath: string) {
  return `${location.protocol}//${location.hostname}:${process.env.HTTP_PORT}/${relativePath}`;
}

export function useYoutube() {
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
    `ws://${location.hostname}:${process.env.WS_PORT}`,
  );

  const [videoInfo, setVideoInfo] = useState<YtdlVideoInfo>();
  const [isSearching, setSearching] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>();
  const [downloadUrl, setDownloadUrl] = useState<string>();

  useEffect(() => {
    if (!lastMessage?.data || typeof lastMessage.data !== 'string') {
      return;
    }

    const msg = parseMessage(lastMessage.data);

    switch (msg.event) {
      case EventType.GetVideoInfo:
        setVideoInfo(msg.data);
        setSearching(false);
        break;
      case EventType.DownloadProgress:
        setDownloadProgress(msg.data);
        break;
      case EventType.ConversionFinished:
        setDownloadUrl(getDownloadUrl(msg.data.path));
        break;
      default:
        console.log(`Unknown message:`, msg);
    }
  }, [lastMessage]);

  const send = <T>(event: EventType, data?: T) => {
    sendJsonMessage([event, data]);
  };

  const getVideoInfo = (videoUrl: string) => {
    setSearching(true);
    setDownloadProgress(undefined);
    setVideoInfo(undefined);

    send(EventType.GetVideoInfo, {
      videoUrl,
    });
  };

  const downloadVideo = (
    videoUrl: string,
    options: {
      outputExtension: string;
      audioBitrate: number;
      cropStart?: number;
      cropEnd?: number;
    },
  ) => {
    if (!videoInfo?.videoDetails) {
      return;
    }
    const { title, lengthSeconds } = videoInfo.videoDetails;

    setDownloadProgress(0);
    send<DownloadQuery>(EventType.Download, {
      ...options,
      videoUrl,
      lengthSeconds: Number(lengthSeconds),
      title,
    });
  };

  const reset = () => {
    /* setVideoInfo(undefined); */
    setSearching(false);
    setDownloadProgress(undefined);
    setDownloadUrl(undefined);
  };

  return {
    getVideoInfo,
    videoInfo,
    downloadVideo,
    downloadUrl,
    isSearching,
    downloadProgress,
    downloadInProgress: downloadProgress !== undefined,
    isConnected: readyState === ReadyState.OPEN,
    reset,
  };
}
