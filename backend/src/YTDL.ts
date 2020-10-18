import { EventEmitter } from 'events';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { parseDuration } from 'shared/date';
import { getVideoIdFromUrl } from 'shared/youtube';
import internal from 'stream';
import TypedEmitter from 'typed-emitter';
import ytdl from 'ytdl-core';
import { fileExists, sanitizeFilename } from './files';
import { ConversionProgress, DownloadOptions } from './types';

export interface YTDLOptions {
  ffmpegPath?: string;
}

interface YTDLEvents {
  error: (error: unknown) => void;
  started: () => void;
  finished: (filePath: string) => void;
  progress: (percentage: number) => void;
}

export class YTDL extends (EventEmitter as new () => TypedEmitter<YTDLEvents>) {
  readonly options: YTDLOptions;
  private conversion?: ffmpeg.FfmpegCommand;
  private downloadStream?: internal.Readable;

  constructor(options: YTDLOptions = {}) {
    super();
    this.options = options;
    this.setupFfmpeg();
  }

  private setupFfmpeg() {
    const { ffmpegPath } = this.options;

    if (ffmpegPath && fileExists(ffmpegPath)) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  async download(videoUrl: string, options: DownloadOptions) {
    const videoId = getVideoIdFromUrl(videoUrl);
    const { title, lengthSeconds } = await (async () => {
      if (options.metaData) {
        return options.metaData;
      } else {
        const { videoDetails } = await ytdl.getInfo(videoUrl);
        const { title, lengthSeconds } = videoDetails;
        return {
          title,
          lengthSeconds: Number(lengthSeconds),
        };
      }
    })();

    const outputExtension = options.outputExtension || 'mp4';
    const outputRoot = path.resolve('../frontend/dist');
    const relativePath = path.join(
      'dl',
      videoId,
      `${sanitizeFilename(title)}.${outputExtension}`
    );
    const outputFile = path.resolve(outputRoot, relativePath);
    const outputDir = path.dirname(outputFile);
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`Downloading video [${lengthSeconds} seconds]: ${title}`);

    this.downloadStream = ytdl(videoUrl, {
      quality: options.itag,
    });

    this.conversion = ffmpeg({ source: this.downloadStream })
      /* .size(`?x${targetFormat.height}`) */
      .audioBitrate(options.audioBitrate || 128)
      .output(outputFile)
      .on('error', (err) => {
        console.error(`Ffmpeg cannot process video: ${err?.message}`);
        this.emit('error', err);
      })
      .on('start', (commandLine) => {
        console.log(`Spawned Ffmpeg with command: ${commandLine}`);
        this.emit('started');
      })
      .on('end', () => {
        console.log('Ffmpeg transcoding succeeded');
        this.emit('finished', relativePath);
      });

    const { cropStart, cropEnd } = options;

    // Set video starting & ending times and calculate video duration
    const startSeconds = !cropStart || cropStart < 0 ? 0 : cropStart;
    const endSeconds =
      !cropEnd || cropEnd > lengthSeconds ? lengthSeconds : cropEnd;
    const duration = endSeconds - startSeconds;

    // Show progress
    this.conversion.on('progress', (progress: ConversionProgress) => {
      const progressSeconds = parseDuration(progress.timemark);
      const percentage = Math.min((progressSeconds / duration) * 100, 100);
      console.log(`Progress: ${percentage.toFixed(2)}%`);
      this.emit('progress', percentage);
    });

    // Crop video
    if (cropStart) {
      this.conversion.seek(startSeconds);
    }

    if (cropEnd !== lengthSeconds) {
      this.conversion.duration(endSeconds);
    }

    this.conversion.run();
  }
}
