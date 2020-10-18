import { YtdlVideoInfo } from "./youtube";

export enum EventType {
  GetVideoInfo = "getVideoInfo",
  Download = "download",
  DownloadProgress = "downloadProgress",
  ConversionFinished = "conversionFinished",
}

// Sent from react to server
export type WSQuery =
  | {
      event: EventType.GetVideoInfo;
      query: VideoUrlQuery;
    }
  | {
      event: EventType.Download;
      query: DownloadQuery;
    }
  | {
      event: EventType.ConversionFinished;
      query: ConversionFinishedData;
    };

// Sent from server to react
export type WSResponse =
  | {
      event: EventType.GetVideoInfo;
      data: GetVideoInfoData;
    }
  | {
      event: EventType.DownloadProgress;
      data: number;
    }
  | {
      event: EventType.ConversionFinished;
      data: ConversionFinishedData;
    };

export interface VideoUrlQuery {
  videoUrl: string;
}

// Get video info
export interface GetVideoInfoQuery {
  videoUrl: string;
}

export type GetVideoInfoData = YtdlVideoInfo | undefined;

// Download
export type DownloadQuery = VideoUrlQuery & {
  title: string;
  lengthSeconds: number;
  outputExtension: string;
  itag: number;
  audioBitrate: number;
  cropStart?: number;
  cropEnd?: number;
};

export interface ConversionFinishedData {
  path: string;
}
