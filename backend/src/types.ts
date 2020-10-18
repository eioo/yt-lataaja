import Ffmpeg from 'fluent-ffmpeg';

export type Conversion = Ffmpeg.FfmpegCommand;

/** For `progress` event in _fluent-ffmpeg_ */
export interface ConversionProgress {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
}

export interface DownloadOptions {
  /** If meta data is provided, ytdl.getVideoInfo is skipped */
  metaData?: {
    title: string;
    lengthSeconds: number;
  };

  /** Itag of the YouTube video */
  itag: number;

  /** Output path for the converted file. Defaults to `process.cwd()` */
  outputPath?: string;

  /** Output file extension*/
  outputExtension?: string;

  /** Start point to crop video from */
  cropStart?: number;

  /** Ending point to crop video to */
  cropEnd?: number;

  /** Audio bitrate, defaults to 128Kbps */
  audioBitrate?: number;

  /** Download ID to emit with events */
  downloadId?: string;
}
