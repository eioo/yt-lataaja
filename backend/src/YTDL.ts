import { EventEmitter } from 'events';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import uniqueId from 'lodash/uniqueId';
import * as path from 'path';
import { parseDuration, secondsToDuration } from 'shared/date';
import { getVideoIdFromUrl } from 'shared/youtube';
import internal from 'stream';
import TypedEmitter from 'typed-emitter';
import ytdl from 'ytdl-core';
import { fileExists, sanitizeFilename } from './files';
import { ConversionProgress, DownloadOptions } from './types';

const outputRoot = 'dl';

export interface YTDLOptions {
  ffmpegPath?: string;
}

interface YTDLEvents {
  error: (error: unknown) => void;
  started: () => void;
  stop: () => void;
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
    this.setupOutputDir();
    this.setupFfmpeg();
    this.addListener('stop', this.stop);
  }

  private setupOutputDir() {
    fs.rmdirSync(outputRoot, { recursive: true });
  }

  private setupFfmpeg() {
    const { ffmpegPath } = this.options;

    if (ffmpegPath && fileExists(ffmpegPath)) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  async stop() {
    if (this.conversion) {
      console.log('Stopping ffmpeg');
      this.conversion.kill('SIGKILL');
    }
  }

  async download(videoUrl: string, options: DownloadOptions) {
    const videoId = getVideoIdFromUrl(videoUrl);
    const { title, lengthSeconds } = await (async () => {
      if (options.metaData) {
        return options.metaData;
      } else {
        const { formats, videoDetails } = await ytdl.getInfo(videoUrl);

        return {
          title: videoDetails.title,
          lengthSeconds:
            Number(
              formats.find((f) => f.itag === options.itag)?.approxDurationMs ||
                0
            ) / 1000,
        };
      }
    })();

    const outputExtension = options.outputExtension || 'mp4';
    const relativePath = path.join(
      outputRoot,
      uniqueId(),
      videoId,
      `${sanitizeFilename(title)}.${outputExtension}`
    );
    const outputFile = path.resolve(outputRoot, relativePath);
    const outputDir = path.dirname(outputFile);
    fs.mkdirSync(outputDir, { recursive: true });

    this.downloadStream = ytdl(videoUrl, {
      quality: options.itag,
    });

    this.conversion = ffmpeg({ source: this.downloadStream })
      /* .size(`?x${targetFormat.height}`) */
      .audioBitrate(options.audioBitrate || 128)
      .output(outputFile)
      .on('error', (err) => {
        if (err.message.includes('SIGKILL')) {
          return;
        }

        console.error(`Ffmpeg cannot process video: ${err.message}`);
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
    const startSeconds =
      cropStart === undefined ? 0 : cropStart < 0 ? 0 : cropStart;
    const endSeconds =
      cropEnd === undefined
        ? 0
        : cropEnd > lengthSeconds
        ? lengthSeconds
        : cropEnd;
    const duration = endSeconds - startSeconds;

    console.log({ startSeconds, endSeconds });
    console.log(
      `Downloading video (Duration: ${secondsToDuration(duration)}: ${title}`
    );

    // Show progress
    this.conversion.on('progress', (progress: ConversionProgress) => {
      const progressSeconds = parseDuration(progress.timemark);
      const percentage = Math.min((progressSeconds / duration) * 100, 100);
      console.log(`Progress: ${percentage.toFixed(2)}%`);
      this.emit('progress', percentage);
    });

    // Crop video
    if (cropStart !== undefined) {
      console.log('Seeking to', secondsToDuration(startSeconds));
      this.conversion.setStartTime(startSeconds);
    }

    if (cropEnd !== lengthSeconds) {
      console.log('Cropping video:', secondsToDuration(duration));
      this.conversion.duration(duration);
    }

    this.conversion.run();
  }
}
